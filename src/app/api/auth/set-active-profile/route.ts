import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { profileId, profileType } = await request.json();

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    let cookieName = 'active_shop_id';
    if (profileType === 'Service Provider') cookieName = 'active_provider_id';
    if (profileType === 'Farmer') cookieName = 'active_farmer_id';
    if (profileType === 'Delivery Partner') cookieName = 'active_delivery_id';

    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: cookieName,
      value: profileId.toString(),
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error: any) {
    console.error('Error setting profile cookie:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
