import { NextResponse } from 'next/server';
import { loginSchema } from "@/schemas";
import { signIn } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  
  // Validate input
  const validatedFields = loginSchema.safeParse(body);
  if (!validatedFields.success) {
    return  NextResponse("Invalid fields!", { status: 400 });
  }

  const { email, password } = validatedFields.data;

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return  NextResponse("Invalid credentials", { status: 401 });
    }

    return  NextResponse.json({ success: true });
    } catch (error) {
      console.error("[LOGIN_POST]", error);
      return NextResponse.json(
        { message: "An unexpected error occurred. Please try again later." }, 
        { status: 500 }
    );
  }
}