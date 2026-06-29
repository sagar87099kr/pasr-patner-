import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const activeProviderId = cookieStore.get('active_provider_id')?.value;
    const userId = cookieStore.get('pasr_token')?.value;

    if (!activeProviderId || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const daysJson = JSON.stringify(body.days || []);

    // Send via URL encoded form data because the backend route expects req.body.daysJson
    // It's defined using app.use(express.urlencoded)
    const formData = new URLSearchParams();
    formData.append('daysJson', daysJson);

    const backendUrl = `${process.env.BACKEND_URL || 'https://www.pasr.in'}/shedule/${activeProviderId}`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userId}`,
        'Cookie': `pasr_token=${userId}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    // Backend returns a redirect, so it won't be res.json() usually.
    if (!response.ok && response.status !== 302 && response.status !== 301) {
        console.error("Backend scheduling error status:", response.status);
        return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Schedule update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
