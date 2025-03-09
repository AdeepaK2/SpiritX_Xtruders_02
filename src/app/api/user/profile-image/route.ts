import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import User from '@/models/userSchema';

export async function PATCH(request: NextRequest) {
  try {
    // Get user ID from query parameter
    const userId = request.nextUrl.searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    if (!body.profileIcon) {
      return NextResponse.json(
        { error: 'Profile icon number is required' },
        { status: 400 }
      );
    }

    // Validate icon number (1-5)
    const iconNumber = Number(body.profileIcon);
    if (isNaN(iconNumber) || iconNumber < 1 || iconNumber > 5) {
      return NextResponse.json(
        { error: 'Profile icon must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    // Connect to database
    await connect();
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update user profile icon
    user.profileIcon = iconNumber;
    
    await user.save();
    
    return NextResponse.json({
      message: 'Profile icon updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileIcon: user.profileIcon
      }
    });
    
  } catch (error: any) {
    console.error('Error updating profile icon:', error);
    return NextResponse.json(
      { error: 'Failed to update profile icon', message: error.message },
      { status: 500 }
    );
  }
}