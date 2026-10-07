import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'Phone parameter required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;

    const backendUrl = `${process.env.BACKEND_URL || 'https://www.pasr.in'}/api/shop/customers/lookup?phone=${encodeURIComponent(phone)}`;

    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId || ''}`,
        'Cookie': `pasr_token=${userId || ''}`
      }
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    console.error('Customer lookup error:', error);
    return NextResponse.json({ error: 'Customer lookup failed', message: error.message }, { status: 500 });
  }
}
