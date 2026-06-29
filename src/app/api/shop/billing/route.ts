import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const activeShopId = cookieStore.get('active_shop_id')?.value;
    const userId = cookieStore.get('pasr_token')?.value;

    if (!activeShopId) {
      return NextResponse.json({ error: 'No active shop selected' }, { status: 400 });
    }

    const body = await req.json();

    // Attach the active shop ID to the payload to prevent tampering
    const payload = { ...body, shopId: activeShopId };

    // Since this is a new local-only endpoint for testing, we point to localhost:8080
    // Once deployed, you should change this back to process.env.BACKEND_URL
    const backendUrl = `http://localhost:8080/api/shop/billing`;

    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId || ''}`,
        'Cookie': `pasr_token=${userId || ''}; active_shop_id=${activeShopId}`
      },
      body: JSON.stringify(payload)
    });

    const responseText = await backendRes.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid response from backend', details: responseText }, { status: 500 });
    }

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error generating bill:', error);
    return NextResponse.json({ error: 'Failed to generate bill', message: error.message }, { status: 500 });
  }
}
