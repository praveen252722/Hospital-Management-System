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
          { name: { $regex: search, $options: 'i' } },
          { specialization: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const doctors = await db.collection('doctors').find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    return NextResponse.json({ message: 'Failed to fetch doctors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const doctor = {
      ...body,
      createdAt: new Date(),
    };

    const result = await db.collection('doctors').insertOne(doctor);
    return NextResponse.json({ ...doctor, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create doctor:', error);
    return NextResponse.json({ message: 'Failed to create doctor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;

    await db.collection('doctors').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    return NextResponse.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Failed to update doctor:', error);
    return NextResponse.json({ message: 'Failed to update doctor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Doctor ID is required' }, { status: 400 });
    }

    await db.collection('doctors').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Failed to delete doctor:', error);
    return NextResponse.json({ message: 'Failed to delete doctor' }, { status: 500 });
  }
}
