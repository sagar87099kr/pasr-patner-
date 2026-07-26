import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/config';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    
    const cookieStore = await cookies();
    const token = cookieStore.get('pasr_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const backendUrl = `${BACKEND_URL}/api/shop/products/search?q=${encodeURIComponent(query)}`;
    
    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pasr_token=${token || ''}`
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
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
