import prisma from "@/lib/prismadb";
import { NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { registerSchema } from "@/schemas";

export async function POST(request) {
  try {
    const body = await request.json();

    // Add default role based on isDriver flag
    const role = body.role || (body.isDriver ? "DRIVER" : "USER");
    const dataToValidate = { ...body, role };

    // Validate input data
    const validatedFields = registerSchema.safeParse(dataToValidate);
    if (!validatedFields.success) {
      return NextResponse.json({ 
        error: "Validation failed",
        details: validatedFields.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { email, name, password, isDriver } = validatedFields.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }, // Case-insensitive email check
      select: { id: true } // Only select necessary fields
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: "Email already registered" 
      }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12); // Increased rounds for better security

    // Use Prisma transaction to ensure both user and driver (if applicable) are created
    const newUser = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          hashedPassword,
          role,
        },
        select: {
          id: true,
          email: true,
          role: true
        }
      });

      // Create driver record if applicable
      if (isDriver) {
        await prisma.driver.create({
          data: {
            userId: user.id,
          }
        });
      }

      return user;
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error("[REGISTER_POST]", error);
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: "A user with this email already exists" 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      error: "An unexpected error occurred during registration" 
    }, { status: 500 });
  }
}