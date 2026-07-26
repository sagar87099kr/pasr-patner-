import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json();

    if (!mobile) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const cookieHeader = request.headers.get('cookie') || '';

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({ username: mobile })
    });

    const responseText = await backendRes.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json({ error: `Backend returned invalid format: ${backendRes.status}` }, { status: 500 });
    }

    if (!backendRes.ok || data.success === false) {
      return NextResponse.json({ error: data.message || 'Mobile number not found' }, { status: backendRes.status });
    }

    const response = NextResponse.json({ success: true, message: data.message || 'OTP sent to your mobile' });

    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }

    return response;
  } catch (error: any) {
    console.error('Forgot password proxy error:', error);
    return NextResponse.json({ error: `Connection Error: ${error.message || String(error)}` }, { status: 500 });
  }
}
