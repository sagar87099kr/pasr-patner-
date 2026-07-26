import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { otp, name, mobile, password, address, referralCode } = body;

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    }

    const cookieHeader = request.headers.get('cookie') || '';

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({
        otp: otp,
        name: name,
        username: mobile,
        password: password,
        address: address,
        referralCode: referralCode
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
      return NextResponse.json({ error: data.message || 'OTP verification failed' }, { status: backendRes.status });
    }

    const userObj = data.user || {};
    const userId = userObj._id || userObj.id;

    const response = NextResponse.json({ success: true, userId, message: 'Account created successfully' });

    if (data.token) {
      response.cookies.set({
        name: 'pasr_token',
        value: data.token,
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Verify OTP proxy error:', error);
    return NextResponse.json({ error: `Connection Error: ${error.message || String(error)}` }, { status: 500 });
  }
}
