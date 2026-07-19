import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const backendUrl = `${process.env.BACKEND_URL || 'https://www.pasr.in'}/api/shop/request-payout`;
    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`,
        'Cookie': `pasr_token=${userId}`
      }
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Request Payout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
