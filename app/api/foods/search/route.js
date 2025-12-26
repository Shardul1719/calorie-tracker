import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FoodCache from '@/models/FoodCache';

// Mock food data as fallback
const mockFoods = {
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  'brown rice': { calories: 112, protein: 2.6, carbs: 24, fats: 0.9 },
  'broccoli': { calories: 55, protein: 3.7, carbs: 11.2, fats: 0.6 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fats: 13 },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  'oatmeal': { calories: 389, protein: 16.9, carbs: 66.3, fats: 6.9 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
  'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
  'almonds': { calories: 579, protein: 21, carbs: 22, fats: 50 },
  'avocado': { calories: 160, protein: 2, carbs: 9, fats: 15 },
};

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase();

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query parameter required' },
        { status: 400 }
      );
    }

    // 1. Check cache first
    const cachedFoods = await FoodCache.find({
      foodName: { $regex: query, $options: 'i' }
    }).limit(10);

    if (cachedFoods.length > 0) {
      // Update hit count
      await Promise.all(
        cachedFoods.map(food => 
          FoodCache.updateOne(
            { _id: food._id },
            { $inc: { hitCount: 1 }, lastUpdated: new Date() }
          )
        )
      );

      return NextResponse.json({
        success: true,
        source: 'cache',
        data: cachedFoods.map(food => ({
          id: food._id,
          name: food.foodName,
          caloriesPer100g: food.caloriesPer100g,
          proteinPer100g: food.proteinPer100g,
          carbsPer100g: food.carbsPer100g,
          fatsPer100g: food.fatsPer100g,
        })),
      });
    }

    // 2. Try Spoonacular API
    if (process.env.SPOONACULAR_API_KEY) {
      try {
        const response = await fetch(
          `https://api.spoonacular.com/food/ingredients/search?query=${query}&number=10&apiKey=${process.env.SPOONACULAR_API_KEY}`
        );

        if (response.ok) {
          const data = await response.json();
          
          // Cache the results
          const cachedResults = await Promise.all(
            data.results.slice(0, 5).map(async (item) => {
              // Fetch detailed nutrition
              const nutritionRes = await fetch(
                `https://api.spoonacular.com/food/ingredients/${item.id}/information?amount=100&unit=grams&apiKey=${process.env.SPOONACULAR_API_KEY}`
              );
              
              if (nutritionRes.ok) {
                const nutritionData = await nutritionRes.json();
                const nutrition = nutritionData.nutrition.nutrients;

                const foodCache = await FoodCache.create({
                  foodName: item.name,
                  spoonacularId: item.id,
                  caloriesPer100g: nutrition.find(n => n.name === 'Calories')?.amount || 0,
                  proteinPer100g: nutrition.find(n => n.name === 'Protein')?.amount || 0,
                  carbsPer100g: nutrition.find(n => n.name === 'Carbohydrates')?.amount || 0,
                  fatsPer100g: nutrition.find(n => n.name === 'Fat')?.amount || 0,
                  apiResponse: nutritionData,
                });

                return {
                  id: foodCache._id,
                  name: foodCache.foodName,
                  caloriesPer100g: foodCache.caloriesPer100g,
                  proteinPer100g: foodCache.proteinPer100g,
                  carbsPer100g: foodCache.carbsPer100g,
                  fatsPer100g: foodCache.fatsPer100g,
                };
              }
              return null;
            })
          );

          return NextResponse.json({
            success: true,
            source: 'api',
            data: cachedResults.filter(Boolean),
          });
        }
      } catch (apiError) {
        console.error('Spoonacular API error:', apiError);
      }
    }

    // 3. Fallback to mock data
    const mockResults = Object.entries(mockFoods)
      .filter(([name]) => name.includes(query))
      .map(([name, nutrition]) => ({
        id: name.replace(/\s+/g, '-'),
        name,
        caloriesPer100g: nutrition.calories,
        proteinPer100g: nutrition.protein,
        carbsPer100g: nutrition.carbs,
        fatsPer100g: nutrition.fats,
      }));

    return NextResponse.json({
      success: true,
      source: 'mock',
      data: mockResults,
    });

  } catch (error) {
    console.error('Food search error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}