import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const activeShopId = cookieStore.get('active_shop_id')?.value;
    const userId = cookieStore.get('pasr_token')?.value;

    if (!activeShopId) {
      return NextResponse.json({ error: 'No active shop selected' }, { status: 400 });
    }

    const backendUrl = `${process.env.BACKEND_URL || 'https://www.pasr.in'}/api/partner/my-profiles`;
    
    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userId || ''}`,
        'Cookie': `pasr_token=${userId || ''}`
      }
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch profile from backend' }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    const shopProfile = data.profiles?.find((p: any) => p._id === activeShopId);

    if (!shopProfile) {
      return NextResponse.json({ error: 'Active shop not found in profiles' }, { status: 404 });
    }

    return NextResponse.json({ profile: shopProfile });

  } catch (error: any) {
    console.error('Error fetching shop profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
