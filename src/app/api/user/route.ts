import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import User from '@/models/userSchema';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connect();

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({
      username,
      password, // Note: In a production app, you should hash passwords
    });

    // Save user to database
    await newUser.save();

    // Return success response
    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in testapi:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to test connection
export async function GET() {
  try {
    await connect();
    return NextResponse.json({ message: 'API is working!' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 }
    );
  }
}