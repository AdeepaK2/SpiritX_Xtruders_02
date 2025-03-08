import { authMiddleware } from "@/middleware/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authError = authMiddleware(req);
  if (authError) return authError;

  return NextResponse.json({ message: "This is a protected route!" });
}
