import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import User from '@/models/userSchema';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body and log it for debugging
    const body = await request.json();
    console.log('Received request body:', body);
    
    const { username, email, password } = body;
    console.log('Extracted fields:', { username, email, password });

    // Validate input
    if (!username || !email || !password) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Email validation failed:', email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connect();
    console.log('Connected to database');

    // Check if user already exists (by username or email)
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('User already exists with username or email');
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with additional fields
    const newUser = new User({
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      profileImage: {  // Initialize with empty image data
        data: null,
        contentType: null,
        uploadDate: null
      },
      budget: 9000000,
      accountCreationDate: new Date(),
      lastLoginDate: new Date()
    });
    
    console.log('About to save user:', { 
      username: newUser.username, 
      email: newUser.email 
    });

    // Save user to database
    await newUser.save();
    console.log('User saved successfully');

    // Return success response without password
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          username: newUser.username,
          email: newUser.email,
          budget: newUser.budget,
          accountCreationDate: newUser.accountCreationDate,
          lastLoginDate: newUser.lastLoginDate
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    // More detailed error logging
    console.error('Error creating user:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => ({
        field,
        message: error.errors[field].message
      }));
      
      console.error('Validation errors:', validationErrors);
      
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validationErrors 
        },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to get all users (non-sensitive data)
export async function GET() {
  try {
    await connect();
    
    // Find all users but exclude password field
    const users = await User.find({}, { password: 0 });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve users' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update user budget (add or reduce)
export async function PATCH(request: NextRequest) {
  try {
    // Get user ID from query parameter: /api/user?id=123
    const userId = request.nextUrl.searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    console.log('Budget transaction request:', body);
    
    // Validate transaction data
    if (body.amount === undefined || isNaN(Number(body.amount))) {
      return NextResponse.json(
        { error: 'Valid transaction amount is required' },
        { status: 400 }
      );
    }

    // Convert amount to number
    const transactionAmount = Number(body.amount);
    const description = body.description || 'Budget adjustment';
    
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
    
    // Calculate new budget
    const currentBudget = user.budget || 9000000; // Fallback if budget isn't set
    const newBudget = currentBudget + transactionAmount;
    
    // Prevent negative budget
    if (newBudget < 0) {
      return NextResponse.json(
        { error: 'Insufficient budget for this transaction' },
        { status: 400 }
      );
    }
    
    // Update user budget
    user.budget = newBudget;
    await user.save();
    
    return NextResponse.json({
      message: 'Budget updated successfully',
      transaction: {
        amount: transactionAmount,
        description: description,
        timestamp: new Date()
      },
      user: {
        username: user.username,
        email: user.email,
        budget: user.budget,
        accountCreationDate: user.accountCreationDate,
        lastLoginDate: user.lastLoginDate
      }
    });
    
  } catch (error: any) {
    console.error('Error updating user budget:', error);
    return NextResponse.json(
      { error: 'Failed to update budget', message: error.message },
      { status: 500 }
    );
  }
}