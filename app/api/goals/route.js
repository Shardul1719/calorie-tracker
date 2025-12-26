import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
import jwt from 'jsonwebtoken';

// Helper to get userId from token
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

// GET - Fetch all goals for user
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

    const goals = await Goal.find({ userId }).sort({ isActive: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: goals,
    });

  } catch (error) {
    console.error('Fetch goals error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new goal
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
    const { name, targetCalories, targetProtein, targetCarbs, targetFats, isActive } = body;

    // Validation
    if (!name || targetCalories == null || targetProtein == null || targetCarbs == null || targetFats == null) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const goal = await Goal.create({
      userId,
      name,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats,
      isActive: isActive || false,
    });

    return NextResponse.json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    }, { status: 201 });

  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}