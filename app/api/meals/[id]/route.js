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

// PUT - Update meal
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const meal = await Meal.findOne({ _id: id, userId });
    
    if (!meal) {
      return NextResponse.json(
        { success: false, message: 'Meal not found' },
        { status: 404 }
      );
    }

    Object.assign(meal, body);
    await meal.save();

    return NextResponse.json({
      success: true,
      message: 'Meal updated successfully',
      data: meal,
    });

  } catch (error) {
    console.error('Update meal error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete meal
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const meal = await Meal.findOneAndDelete({ _id: id, userId });
    
    if (!meal) {
      return NextResponse.json(
        { success: false, message: 'Meal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Meal deleted successfully',
    });

  } catch (error) {
    console.error('Delete meal error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}