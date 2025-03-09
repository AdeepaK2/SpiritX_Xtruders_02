import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split(" ")[1];
    
    // In a real app, we would verify the token properly
    // But for now, we'll just check that it starts with our prefix
    if (!token.startsWith("valid-token-")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: 1, 
        username: "admin", 
        role: "admin" 
      }
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}