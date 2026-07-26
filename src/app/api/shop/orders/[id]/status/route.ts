import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/config';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const activeShopId = cookieStore.get('active_shop_id')?.value;
    const userId = cookieStore.get('pasr_token')?.value;

    if (!activeShopId) {
      return NextResponse.json({ error: 'No active shop selected' }, { status: 400 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const backendUrl = `${BACKEND_URL}/api/shop/orders/${id}/status`;
    
    // Pass shopId inside the payload to the backend
    const payload = { status, shopId: activeShopId };

    const backendRes = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId || ''}`,
        'Cookie': `pasr_token=${userId || ''}; active_shop_id=${activeShopId}`
      },
      body: JSON.stringify(payload)
    });

    const responseText = await backendRes.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid response from backend' }, { status: 500 });
    }

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
