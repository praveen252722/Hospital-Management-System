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
          { patientName: { $regex: search, $options: 'i' } },
          { doctorName: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const appointments = await db.collection('appointments').find(query).sort({ date: -1 }).toArray();
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json({ message: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const appointment = {
      ...body,
      status: body.status || 'scheduled',
      createdAt: new Date(),
    };

    const result = await db.collection('appointments').insertOne(appointment);
    return NextResponse.json({ ...appointment, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json({ message: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;

    await db.collection('appointments').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    return NextResponse.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return NextResponse.json({ message: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Appointment ID is required' }, { status: 400 });
    }

    await db.collection('appointments').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete appointment:', error);
    return NextResponse.json({ message: 'Failed to delete appointment' }, { status: 500 });
  }
}
