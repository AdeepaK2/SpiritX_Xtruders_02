import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import User from '@/models/userSchema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log("Login attempt for:", email);
    
    // Validate request
    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json({
        success: false,
        error: "Email and password are required"
      }, { status: 400 });
    }

    // Connect to database
    await connect();
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json({
        success: false,
        error: "Invalid email or password"
      }, { status: 401 });
    }
    
    console.log("User found:", user._id);
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return NextResponse.json({
        success: false,
        error: "Invalid email or password"
      }, { status: 401 });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Update last login date
    user.lastLoginDate = new Date();
    await user.save();
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    const userId = user._id.toString();
    console.log("Login successful. Returning userId:", userId);
    
    // Return success with user ID
    return NextResponse.json({
      success: true,
      message: "Login successful",
      userId: userId
    });
    
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      error: "An error occurred during login"
    }, { status: 500 });
  }
}
