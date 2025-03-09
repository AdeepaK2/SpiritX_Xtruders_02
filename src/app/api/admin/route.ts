import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import Admin from '@/models/adminSchema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Ensure we have a JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { username, password, action } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Determine if this is a registration or login request
    if (action === 'register') {
      // ADMIN CREATION LOGIC
      
      // Check if username already exists
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new admin
      const newAdmin = new Admin({
        username,
        password: hashedPassword,
        role: 'Admin'
      });

      // Save to database
      await newAdmin.save();

      // Generate JWT token for immediate login
      const token = jwt.sign(
        { id: newAdmin._id, username: newAdmin.username },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return success response without sending the password
      return NextResponse.json({ 
        message: 'Admin created successfully',
        token,
        admin: {
          id: newAdmin._id,
          username: newAdmin.username,
          role: newAdmin.role
        }
      }, { status: 201 });
      
    } else {
      // LOGIN LOGIC
      
      // Find the admin user
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id, username: admin.username },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return successful response with token
      return NextResponse.json({ 
        message: 'Login successful', 
        token,
        admin: {
          id: admin._id,
          username: admin.username
        }
      }, { status: 200 });
    }
    
  } catch (error) {
    console.error('Error processing admin request:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}



// GET - Get admin by ID
export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const admin = await Admin.findById(id).select('-password');
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ admin }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT - Update admin
export async function PUT(request: NextRequest) {
  try {
    await connect();
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }
    
    const { username, currentPassword, newPassword } = await request.json();
    
    // Find admin
    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    // Prepare update object
    const updateData: { username?: string, password?: string } = {};
    
    // Update username if provided
    if (username && username !== admin.username) {
      // Check if username already exists
      const existingAdmin = await Admin.findOne({ username });
      if (existingAdmin && existingAdmin._id.toString() !== id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
      updateData.username = username;
    }
    
    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
      
      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }
    
    // Update admin
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid update data provided' }, { status: 400 });
    }
    
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    return NextResponse.json({ 
      message: 'Admin updated successfully',
      admin: updatedAdmin
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Delete admin
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Admin deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}