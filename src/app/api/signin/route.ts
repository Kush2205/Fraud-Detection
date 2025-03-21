import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: "Email and password are required" 
      }, { status: 400 });
    }
    
   
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid email or password" 
      }, { status: 401 });
    }

    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid email or password" 
      }, { status: 401 });
    }

   
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token
    }, { status: 200 });
  } catch (error) {
    console.error("SignIn error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "An error occurred during sign in" 
    }, { status: 500 });
  }
}