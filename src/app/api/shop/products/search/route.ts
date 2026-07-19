import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_BASE_URL } from '@/lib/config';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;

    const backendUrl = `${BACKEND_BASE_URL}/api/shop/products/search?q=${encodeURIComponent(query)}`;
    
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
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
