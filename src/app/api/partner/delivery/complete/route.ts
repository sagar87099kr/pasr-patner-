import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { orderId, otp } = await req.json();
    
    const cookieStore = await cookies();
    const userId = cookieStore.get('pasr_token')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    if (!orderId || !otp) {
      return NextResponse.json({ error: 'Missing orderId or OTP' }, { status: 400 });
    }

    // Call the backend endpoint
    const backendUrl = `${process.env.BACKEND_URL || 'https://www.pasr.in'}/delivery/order/${orderId}/complete`;
    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`,
        'Cookie': `pasr_token=${userId}`
      },
      body: JSON.stringify({ otp })
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
    console.error('Delivery Complete Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
