import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = `${process.env.BACKEND_URL || 'https://www.pasr.in'}/api/partner/register-farmer`;
    
    const bodyText = await req.text();
    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers.get('Content-Type') || 'application/json',
        'Authorization': `Bearer ${userId}`
      },
      body: bodyText
    });

    let data;
    const resText = await backendRes.text();
    try {
      data = JSON.parse(resText);
    } catch(e) {
      data = { error: 'Invalid response from backend' };
    }
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error registering farmer:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
