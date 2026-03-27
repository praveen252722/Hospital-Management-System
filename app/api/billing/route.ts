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
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const bills = await db.collection('billing').find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Failed to fetch billing:', error);
    return NextResponse.json({ message: 'Failed to fetch billing' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const bill = {
      ...body,
      status: body.status || 'pending',
      createdAt: new Date(),
    };

    const result = await db.collection('billing').insertOne(bill);
    return NextResponse.json({ ...bill, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create bill:', error);
    return NextResponse.json({ message: 'Failed to create bill' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;

    await db.collection('billing').updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    return NextResponse.json({ message: 'Bill updated successfully' });
  } catch (error) {
    console.error('Failed to update bill:', error);
    return NextResponse.json({ message: 'Failed to update bill' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Bill ID is required' }, { status: 400 });
    }

    await db.collection('billing').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Failed to delete bill:', error);
    return NextResponse.json({ message: 'Failed to delete bill' }, { status: 500 });
  }
}
