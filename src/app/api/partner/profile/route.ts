import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/config';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;
    const activeShopId = cookieStore.get('active_shop_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!activeShopId) {
      return NextResponse.json({ error: 'No active shop selected' }, { status: 400 });
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userId}`,
      'Cookie': `pasr_token=${userId}`
    };

    // Fetch Shop Settings
    const settingsRes = await fetch(`${BACKEND_URL}/api/shop/settings?shopId=${activeShopId}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    // Fetch Shop Dashboard Stats
    const dashboardRes = await fetch(`${BACKEND_URL}/api/shop/dashboard?shopId=${activeShopId}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (!settingsRes.ok || !dashboardRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch shop details' }, { status: 500 });
    }

    const settingsData = await settingsRes.json();
    const dashboardData = await dashboardRes.json();

    if (!settingsData.success || !dashboardData.success) {
      return NextResponse.json({ error: 'Invalid response from backend' }, { status: 500 });
    }

    const shop = settingsData.shop;
    const dash = dashboardData.dashboard;

    // Fetch Recent Orders (Optional, for recentActivity)
    let recentActivity = [];
    try {
      const ordersRes = await fetch(`${BACKEND_URL}/api/shop/orders?shopId=${activeShopId}`, {
        method: 'GET',
        headers,
        cache: 'no-store'
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.orders) {
          // Take the 5 most recent completed/delivered orders
          recentActivity = ordersData.orders
            .filter((o: any) => o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED')
            .slice(0, 5)
            .map((o: any) => ({
              id: o.orderId || o._id.substring(o._id.length - 6),
              amount: o.subtotalAmount || o.totalAmount || 0,
              time: Math.floor((new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60)) // hours ago
            }));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch recent orders:", e);
    }

    // Construct profile response for frontend
    const profile = {
      name: shop.shopName || 'My Shop',
      type: 'Shop Owner',
      earnings: `₹${dash.revenue || 0}`,
      activeOrders: dash.pendingOrders || 0,
      rating: '4.8 ★', // Placeholder rating
      recentActivity: recentActivity,
      activeShopId: shop._id
    };

    return NextResponse.json(profile);

  } catch (error: any) {
    console.error("Profile Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
