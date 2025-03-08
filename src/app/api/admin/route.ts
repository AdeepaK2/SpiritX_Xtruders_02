import { NextRequest, NextResponse } from 'next/server';
import connect from '@/utils/db';
import Admin from '@/models/adminSchema';
import bcrypt from 'bcryptjs';

export const config = {
  api: {
    bodyParser: true,
  },
};

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret';

// Admin Registration
export async function POST(request: NextRequest) {
  try {
    await connect();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();

    return NextResponse.json({ message: 'Admin registered successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error registering admin' }, { status: 500 });
  }
}


// Get Admin Details
export async function GET(request: NextRequest) {
  try {
    await connect();
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const admin = await Admin.findById(id).select('-password'); // Exclude password from response
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ admin }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching admin' }, { status: 500 });
  }
}

// Delete Admin
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
    return NextResponse.json({ error: 'Error deleting admin' }, { status: 500 });
  }
}
