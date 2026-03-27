import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = {};
    if (search) {
      query = {
        $or: [
          { medicineName: { $regex: search, $options: 'i' } },
          { supplier: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const medicines = await db.collection('pharmacy').find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(medicines);
  } catch (error) {
    console.error('Failed to fetch pharmacy:', error);
    return NextResponse.json({ message: 'Failed to fetch pharmacy' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const medicine = {
      ...body,
      createdAt: new Date(),
    };

    const result = await db.collection('pharmacy').insertOne(medicine);
    return NextResponse.json({ ...medicine, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create medicine:', error);
    return NextResponse.json({ message: 'Failed to create medicine' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;

    await db.collection('pharmacy').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    return NextResponse.json({ message: 'Medicine updated successfully' });
  } catch (error) {
    console.error('Failed to update medicine:', error);
    return NextResponse.json({ message: 'Failed to update medicine' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Medicine ID is required' }, { status: 400 });
    }

    await db.collection('pharmacy').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error('Failed to delete medicine:', error);
    return NextResponse.json({ message: 'Failed to delete medicine' }, { status: 500 });
  }
}
