import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_BASE_URL } from '@/lib/config';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;
    const activeShopId = cookieStore.get('active_shop_id')?.value;

    const backendUrl = `${BACKEND_BASE_URL}/api/partner/profile`;
    
    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId || ''}`,
        'Cookie': `pasr_token=${userId || ''}`
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
      return NextResponse.json({ ...data, activeShopId }, { status: backendRes.status });
    }

    return NextResponse.json({ ...data, activeShopId });

  } catch (error: any) {
    console.error("Profile Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
