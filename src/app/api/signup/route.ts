import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json();
        
        if (!email || !password || !name) {
            return NextResponse.json({
                success: false,
                message: "Email, password and name are required"
            }, { status: 400 });
        }
        
        const user = await prisma.user.findUnique({
            where: { email }
        });
        
        if (user) {
            return NextResponse.json({
                success: false,
                message: "User already exists"
            }, { status: 400 });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
        
        const jwtSecret = process.env.JWT_SECRET;
        
        if (!jwtSecret) {
            console.error("JWT_SECRET environment variable is not defined");
            return NextResponse.json({
                success: false,
                message: "Server configuration error"
            }, { status: 500 });
        }
        
        const token = jwt.sign(
            {
                userId: newUser.id,
                email: newUser.email,
                name: newUser.name
            },
            jwtSecret,
            { expiresIn: '24h' }
        );
        
        
        const { password: _, ...userWithoutPassword } = newUser;
        
        return NextResponse.json({
            success: true,
            message: "User created successfully",
            user: userWithoutPassword,
            token
        }, { status: 201 });
    } catch (error) {
        console.error("Signup error:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to create account. Please try again later."
        }, { status: 500 });
    }
}