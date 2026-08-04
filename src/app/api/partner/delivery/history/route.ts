import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const url = new URL(req.url);
    const skip = url.searchParams.get('skip') || '0';
    const backendUrl = `${process.env.BACKEND_URL || 'https://www.pasr.in'}/delivery/api/history?skip=${skip}`;
    const backendRes = await fetch(backendUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${userId}`,
        'Cookie': `pasr_token=${userId}`
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
    console.error('Delivery History Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
