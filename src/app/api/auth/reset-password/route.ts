import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { mobile, otp, newPassword } = await request.json();

    if (!mobile || !otp || !newPassword) {
      return NextResponse.json({ error: 'Mobile, OTP, and new password are required' }, { status: 400 });
    }

    const cookieHeader = request.headers.get('cookie') || '';

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({
        username: mobile,
        otp: otp,
        newPassword: newPassword
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
      return NextResponse.json({ error: data.message || 'Failed to reset password' }, { status: backendRes.status });
    }

    return NextResponse.json({ success: true, message: data.message || 'Password updated successfully' });
  } catch (error: any) {
    console.error('Reset password proxy error:', error);
    return NextResponse.json({ error: `Connection Error: ${error.message || String(error)}` }, { status: 500 });
  }
}
