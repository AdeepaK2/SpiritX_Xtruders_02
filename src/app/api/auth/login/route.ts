import user from "@/models/userSchema";
import connect from "@/utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    await connect();
    const { email, password } = await req.json();

    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ userId: existingUser._id }, JWT_SECRET, { expiresIn: "1h" });

    // ✅ Return `userId` along with the token
    return NextResponse.json({ 
      message: "Login successful", 
      token, 
      userId: existingUser._id.toString()  // Ensure userId is a string
    }, { status: 200 });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
