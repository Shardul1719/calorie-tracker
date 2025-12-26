import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Meal from '@/models/Meal';
import jwt from 'jsonwebtoken';

function getUserIdFromToken(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    const date = dateParam ? new Date(dateParam) : new Date();
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const stats = meals.reduce(
      (acc, meal) => ({
        totalCalories: acc.totalCalories + meal.totalCalories,
        totalProtein: acc.totalProtein + meal.totalProtein,
        totalCarbs: acc.totalCarbs + meal.totalCarbs,
        totalFats: acc.totalFats + meal.totalFats,
        mealCount: acc.mealCount + 1,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0, mealCount: 0 }
    );

    return NextResponse.json({
      success: true,
      data: {
        date: date.toISOString().split('T')[0],
        ...stats,
        meals,
      },
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}