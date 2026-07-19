import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_BASE_URL } from '@/lib/config';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const activeShopId = cookieStore.get('active_shop_id')?.value;
    const userId = cookieStore.get('pasr_token')?.value;

    if (!activeShopId) {
      return NextResponse.json({ error: 'No active shop selected' }, { status: 400 });
    }

    const backendUrl = `${BACKEND_BASE_URL}/api/shop/products?shopId=${activeShopId}`;
    
    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId || ''}`,
        'Cookie': `pasr_token=${userId || ''}; active_shop_id=${activeShopId}`
      }
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
    console.error('Error fetching shop products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const activeShopId = cookieStore.get('active_shop_id')?.value;
    const userId = cookieStore.get('pasr_token')?.value;

    if (!activeShopId) {
      return NextResponse.json({ error: 'No active shop selected' }, { status: 400 });
    }

    const body = await req.json();

    const backendUrl = `${BACKEND_BASE_URL}/api/shop/products`;
    
    // Pass shopId inside the payload to the backend
    const payload = { ...body, shopId: activeShopId };

    const backendRes = await fetch(backendUrl, {
      method: 'POST',
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
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
