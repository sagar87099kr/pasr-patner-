import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongoose';
import { Shop } from '@/models/Shop';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const activeShopId = cookieStore.get('active_shop_id')?.value;
    
    if (!activeShopId) {
      return NextResponse.json({ error: 'No active shop selected' }, { status: 401 });
    }

    await connectToDatabase();
    
    const shop = await Shop.findById(activeShopId);
    
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    // Initialize for existing shops that don't have the field yet
    if (shop.aiCatalogCredits === undefined) {
        shop.aiCatalogCredits = 5;
        shop.lastAiCreditRefillDate = new Date();
        await shop.save();
    }

    // Auto-refill logic: 5 free credits every month
    const now = new Date();
    const lastRefill = shop.lastAiCreditRefillDate || shop.createdAt || now;
    
    if (now.getMonth() !== lastRefill.getMonth() || now.getFullYear() !== lastRefill.getFullYear()) {
        shop.aiCatalogCredits = (shop.aiCatalogCredits || 0) + 5;
        shop.lastAiCreditRefillDate = now;
        await shop.save();
    }

    return NextResponse.json({ credits: shop.aiCatalogCredits });

  } catch (error: any) {
    console.error('Error fetching AI credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
