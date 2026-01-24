import { db } from '@devteam/database';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    console.log('Signup attempt:', { email: json.email });

    const body = signupSchema.parse(json);

    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      console.log('User already exists:', body.email);
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await db.user.create({
      data: {
        email: body.email,
        name: body.name,
        passwordHash: hashedPassword,
      },
    });

    console.log('User created:', user.id);
    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 },
    );
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }

    // Return more detailed error in development
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
