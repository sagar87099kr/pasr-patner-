import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_BASE_URL } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const { orderId, otp } = await req.json();
    
    const cookieStore = await cookies();
    const activeShopId = cookieStore.get('active_shop_id')?.value;
    const userId = cookieStore.get('pasr_token')?.value;

    if (!activeShopId) {
      return NextResponse.json({ error: 'Unauthorized. No active shop selected.' }, { status: 401 });
    }

    if (!orderId || !otp) {
      return NextResponse.json({ error: 'Missing orderId or OTP' }, { status: 400 });
    }

    const backendUrl = `${BACKEND_BASE_URL}/api/shop/orders/verify-otp`;
    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId || ''}`,
        'Cookie': `pasr_token=${userId || ''}; active_shop_id=${activeShopId}`
      },
      body: JSON.stringify({ orderId, otp, shopId: activeShopId })
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
    console.error('OTP Verification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
