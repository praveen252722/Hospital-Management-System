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
          { phone: { $regex: search, $options: 'i' } },
          { disease: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const patients = await db.collection('patients').find(query).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return NextResponse.json({ message: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const patient = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('patients').insertOne(patient);
    return NextResponse.json({ ...patient, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create patient:', error);
    return NextResponse.json({ message: 'Failed to create patient' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;

    await db.collection('patients').updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    return NextResponse.json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Failed to update patient:', error);
    return NextResponse.json({ message: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Patient ID is required' }, { status: 400 });
    }

    await db.collection('patients').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Failed to delete patient:', error);
    return NextResponse.json({ message: 'Failed to delete patient' }, { status: 500 });
  }
}
