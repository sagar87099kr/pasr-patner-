import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/config';


export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Proxy to Express backend
    const backendUrl = `${BACKEND_URL}/api/partner/me`;
    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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

    if (!backendRes.ok || data.success === false) {
      return NextResponse.json(data, { status: backendRes.status || 400 });
    }

    return NextResponse.json({ user: data.user });


  } catch (error: any) {
    console.error('Error fetching user proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
