import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);
    return null; // Allow access
  } catch (error) {
    return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
  }
}
