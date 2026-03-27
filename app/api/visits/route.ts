import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const patientId = searchParams.get('patientId');

    let query: Record<string, unknown> = {};
    if (search) {
      query = {
        $or: [
          { patientName: { $regex: search, $options: 'i' } },
          { doctorName: { $regex: search, $options: 'i' } },
          { disease: { $regex: search, $options: 'i' } },
        ],
      };
    }
    if (patientId) {
      query.patientId = patientId;
    }

    const visits = await db.collection('visits').find(query).sort({ visitDate: -1 }).toArray();
    return NextResponse.json(visits);
  } catch (error) {
    console.error('Failed to fetch visits:', error);
    return NextResponse.json({ message: 'Failed to fetch visits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const visit = {
      ...body,
      createdAt: new Date(),
    };

    const result = await db.collection('visits').insertOne(visit);
    return NextResponse.json({ ...visit, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create visit:', error);
    return NextResponse.json({ message: 'Failed to create visit' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;

    await db.collection('visits').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    return NextResponse.json({ message: 'Visit updated successfully' });
  } catch (error) {
    console.error('Failed to update visit:', error);
    return NextResponse.json({ message: 'Failed to update visit' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Visit ID is required' }, { status: 400 });
    }

    await db.collection('visits').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    console.error('Failed to delete visit:', error);
    return NextResponse.json({ message: 'Failed to delete visit' }, { status: 500 });
  }
}
