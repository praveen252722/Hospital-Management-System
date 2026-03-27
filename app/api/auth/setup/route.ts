import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Email, password, and name are required' }, { status: 400 });
    }

    // Check if any admin exists
    const existingAdmin = await db.collection('admins').findOne({});

    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin setup already completed' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
    };

    const result = await db.collection('admins').insertOne(admin);

    return NextResponse.json({
      message: 'Admin created successfully',
      admin: {
        id: result.insertedId.toString(),
        email,
        name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json({ message: 'Failed to create admin' }, { status: 500 });
  }
}
