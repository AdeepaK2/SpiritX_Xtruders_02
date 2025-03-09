import { NextRequest, NextResponse } from "next/server";
import connect  from "@/utils/db";
import bcrypt from "bcrypt";


// Assuming you have an Admin model/schema
// If not, you'll need to create one in your project

// Admin schema example (create this in a separate file if it doesn't exist)
import mongoose from "mongoose";

// Check if Admin model already exists to prevent overwriting
const Admin = mongoose.models.Admin || mongoose.model(
  "Admin",
  new mongoose.Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        default: "admin",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    { timestamps: true }
  )
);

// POST: Create new admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await connect();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }],
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email or username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = await Admin.create({
      username,
      email,
      password: hashedPassword,
    });

    // Return created admin without password
    const adminWithoutPassword = {
      _id: newAdmin._id,
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role,
      createdAt: newAdmin.createdAt,
    };

    return NextResponse.json(
      { message: "Admin created successfully", admin: adminWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    );
  }
}

// GET: Retrieve admin(s) or verify login credentials
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connect();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const username = searchParams.get("username");
    const password = searchParams.get("password");
    const verifyLogin = searchParams.get("verifyLogin");

    // Handle login verification
    if (verifyLogin === "true" && (username || email) && password) {
      const query: any = {};
      if (email) query.email = email;
      if (username) query.username = username;

      // Find admin - include password for verification
      const admin = await Admin.findOne(query);

      // Check if admin exists
      if (!admin) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      // Compare password
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      // Return admin without password
      const adminWithoutPassword = {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      };

      return NextResponse.json(
        { message: "Login successful", admin: adminWithoutPassword },
        { status: 200 }
      );
    }

    // If email or username provided (without verify login), find specific admin
    if (email || username) {
      const query: any = {};
      if (email) query.email = email;
      if (username) query.username = username;

      const admin = await Admin.findOne(query).select("-password");

      if (!admin) {
        return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      }

      return NextResponse.json({ admin }, { status: 200 });
    }

    // Otherwise, return all admins (usually protected by authorization)
    // In a real app, you would limit this to authorized super admins
    const admins = await Admin.find({}).select("-password");
    
    return NextResponse.json({ admins }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving admin(s):", error);
    return NextResponse.json(
      { error: "Failed to retrieve admin(s)" },
      { status: 500 }
    );
  }
}