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

    // Attempt to resolve userId to a JWT payload string or an ObjectId
    // Our new login route saves the JWT token! 
    // We need to parse the token to get the user ID since the cookie is a JWT now.
    let actualUserId = userId;
    try {
      if (userId.includes('.')) {
        // It's a JWT. Decode the payload (middle segment)
        const payloadStr = Buffer.from(userId.split('.')[1], 'base64').toString();
        const payload = JSON.parse(payloadStr);
        if (payload && payload.id) {
          actualUserId = payload.id;
        }
      }
    } catch (err) {
      console.warn("Failed to decode JWT, assuming it's a raw user ID");
    }

    // First, find the customer to get their phone number (for deliverypartners)
    const customer = await db.collection('customers').findOne({ _id: new mongoose.Types.ObjectId(actualUserId) });

    const profiles: any[] = [];

    // 1. Check if they own any Shops
    const shops = await db.collection('shops').find({ owner: new mongoose.Types.ObjectId(actualUserId) }).toArray();
    shops.forEach(shop => {
      profiles.push({
        _id: shop._id,
        type: 'Shop Owner',
        category: shop.category || 'Retail',
        businessName: shop.shopName
      });
    });

    // 2. Check if they are a Service Provider
    const providers = await db.collection('providers').find({ owner: new mongoose.Types.ObjectId(actualUserId) }).toArray();
    providers.forEach(provider => {
      profiles.push({
        _id: provider._id,
        type: 'Service Provider',
        category: provider.categories,
        businessName: provider.company || provider.name || 'Service Provider'
      });
    });

    // 3. Check if they are a Delivery Partner (matching by phone number since they lack an 'owner' field)
    if (customer && customer.username) {
      const deliveryPartners = await db.collection('deliverypartners').find({ phoneNumber: Number(customer.username) }).toArray();
      deliveryPartners.forEach(dp => {
        profiles.push({
          _id: dp._id,
          type: 'Delivery Partner',
          category: 'Logistics',
          businessName: dp.fullName || 'Delivery Partner'
        });
      });
    }

    return NextResponse.json({ profiles });
  } catch (error: any) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
