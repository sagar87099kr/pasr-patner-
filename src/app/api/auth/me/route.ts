import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const db = mongoose.connection.db;
    
    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    let actualUserId = userId;
    try {
      if (userId.includes('.')) {
        const payloadStr = Buffer.from(userId.split('.')[1], 'base64').toString();
        const payload = JSON.parse(payloadStr);
        if (payload && payload.id) {
          actualUserId = payload.id;
        }
      }
    } catch (err) {
      console.warn("Failed to decode JWT");
    }

    const customer = await db.collection('customers').findOne({ _id: new mongoose.Types.ObjectId(actualUserId) });

    if (!customer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      user: {
        name: customer.name || '',
        phone: customer.username ? customer.username.toString() : '',
        address: customer.address || ''
      } 
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
