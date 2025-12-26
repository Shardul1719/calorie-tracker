import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Goal from '@/models/Goal';
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

// PUT - Update goal
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

    const goal = await Goal.findOne({ _id: id, userId });
    
    if (!goal) {
      return NextResponse.json(
        { success: false, message: 'Goal not found' },
        { status: 404 }
      );
    }

    // Update fields
    Object.assign(goal, body);
    await goal.save();

    return NextResponse.json({
      success: true,
      message: 'Goal updated successfully',
      data: goal,
    });

  } catch (error) {
    console.error('Update goal error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete goal
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

    const goal = await Goal.findOneAndDelete({ _id: id, userId });
    
    if (!goal) {
      return NextResponse.json(
        { success: false, message: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully',
    });

  } catch (error) {
    console.error('Delete goal error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}