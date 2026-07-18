import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongoose';
import { Shop } from '@/models/Shop';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const activeShopId = cookieStore.get('active_shop_id')?.value;
    
    if (!activeShopId) {
      return NextResponse.json({ error: 'No active shop selected' }, { status: 401 });
    }

    const { amount, paymentId } = await req.json();

    if (!amount || !paymentId) {
      return NextResponse.json({ error: 'Amount and Payment ID are required' }, { status: 400 });
    }

    await connectToDatabase();
    
    const shop = await Shop.findById(activeShopId);
    
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    shop.aiCatalogCredits = (shop.aiCatalogCredits || 0) + amount;
    await shop.save();

    return NextResponse.json({ success: true, creditsRemaining: shop.aiCatalogCredits });

  } catch (error: any) {
    console.error('Error adding AI credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
