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

// GET - Fetch meals with filters
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
    const date = searchParams.get('date');
    const mealType = searchParams.get('mealType');

    let query = { userId };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (mealType) {
      query.mealType = mealType;
    }

    const meals = await Meal.find(query).sort({ date: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: meals,
    });

  } catch (error) {
    console.error('Fetch meals error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new meal
export async function POST(request) {
  try {
    await connectDB();
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mealName, mealType, date, foodItems } = body;

    if (!mealName || !mealType || !foodItems || foodItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const meal = await Meal.create({
      userId,
      mealName,
      mealType,
      date: date || new Date(),
      foodItems,
    });

    return NextResponse.json({
      success: true,
      message: 'Meal created successfully',
      data: meal,
    }, { status: 201 });

  } catch (error) {
    console.error('Create meal error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}