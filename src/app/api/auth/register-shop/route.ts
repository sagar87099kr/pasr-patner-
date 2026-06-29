import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = `${process.env.BACKEND_URL || 'https://www.pasr.in'}/api/partner/register-shop`;
    
    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers.get('Content-Type') || 'application/json',
        'Authorization': `Bearer ${userId}`
      },
      body: req.body,
      // @ts-ignore
      duplex: 'half'
    });

    const data = await backendRes.json();
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error registering shop:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
