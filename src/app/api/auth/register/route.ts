import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { name, mobile, password } = await request.json();

    if (!mobile || !password) {
      return NextResponse.json({ error: 'Mobile and password are required' }, { status: 400 });
    }

    const cookieHeader = request.headers.get('cookie') || '';

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({
        name: name || '',
        username: mobile,
        password: password
      })
    });

    const responseText = await backendRes.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      return NextResponse.json({ error: `Backend returned invalid format: ${backendRes.status}` }, { status: 500 });
    }

    if (!backendRes.ok || data.success === false) {
      return NextResponse.json({ error: data.message || 'Failed to send OTP' }, { status: backendRes.status });
    }

    const response = NextResponse.json({ success: true, message: data.message || 'OTP sent successfully' });

    // Forward any session cookie returned by backend
    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }

    return response;
  } catch (error: any) {
    console.error('Register proxy error:', error);
    return NextResponse.json({ error: `Connection Error: ${error.message || String(error)}` }, { status: 500 });
  }
}
