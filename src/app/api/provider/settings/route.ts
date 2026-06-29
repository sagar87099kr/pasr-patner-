import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const activeProviderId = cookieStore.get('active_provider_id')?.value;
    const userId = cookieStore.get('pasr_token')?.value;

    if (!activeProviderId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Forward data to legacy express backend
    const backendUrl = `${process.env.BACKEND_URL || 'https://www.pasr.in'}/update/${activeProviderId}`;

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${userId}`,
        'Cookie': `pasr_token=${userId}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ provider: body })
    });

    // Backend returns a redirect after successful update
    if (!response.ok && response.status !== 302 && response.status !== 301) {
        console.error("Backend settings update error status:", response.status);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
