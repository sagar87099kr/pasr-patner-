import { NextResponse } from 'next/server';
import { BACKEND_BASE_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { mobile, password } = await request.json();

    if (!mobile || !password) {
      return NextResponse.json({ error: 'Mobile and password are required' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const backendRes = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: mobile, // The backend expects 'username'
        password: password,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await backendRes.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse backend response:', responseText);
      return NextResponse.json({ error: `Backend returned invalid format: ${backendRes.status}` }, { status: 500 });
    }

    if (!backendRes.ok || data.success === false) {
      return NextResponse.json({ error: data.message || 'Invalid mobile number or password' }, { status: 401 });
    }

    // Check for user ID in multiple possible fields since backend might map _id to id
    const userObj = data.user || {};
    const userId = userObj._id || userObj.id;

    if (!userId || !data.token) {
      throw new Error(`Auth successful but missing ID or token. Data: ${JSON.stringify(data)}`);
    }

    // Login successful!
    const response = NextResponse.json({ success: true, userId: userId });
    
    // Set a cookie (Expires in 7 days) so the user stays logged in on the Partner portal
    // We must save the JWT token from the backend, NOT the userId!
    response.cookies.set({
      name: 'pasr_token',
      value: data.token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error: any) {
    console.error('Login proxy error:', error);
    return NextResponse.json({ error: `Connection Error: ${error.message || String(error)}` }, { status: 500 });
  }
}
