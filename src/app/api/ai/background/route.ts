import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { client } from '@gradio/client';
import connectToDatabase from '@/lib/mongoose';
import { Shop } from '@/models/Shop';

export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const activeShopId = cookieStore.get('active_shop_id')?.value;
    
    if (!activeShopId) {
      return NextResponse.json({ error: 'No active shop selected' }, { status: 401 });
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    await connectToDatabase();
    const shop = await Shop.findById(activeShopId);
    
    if (!shop || (shop.aiCatalogCredits || 0) <= 0) {
      return NextResponse.json({ error: 'Insufficient AI Credits. Please recharge.' }, { status: 403 });
    }

    // Deduct credit
    shop.aiCatalogCredits = (shop.aiCatalogCredits || 0) - 1;
    shop.totalAiCatalogsGenerated = (shop.totalAiCatalogsGenerated || 0) + 1;
    await shop.save();

    // 2. Connect to Hugging Face BRIA-RMBG-2.0 space
    // Convert base64 to Blob
    const response = await fetch(imageBase64);
    const imageBlob = await response.blob();
    
    const app = await client("briaai/BRIA-RMBG-2.0");
    
    // Gradio Endpoint: /image
    // Parameters:
    // 0: file (Image)
    const result = await app.predict("/image", [
      imageBlob
    ]);

    // The result is usually a tuple of [composite image, mask image]
    // result.data[0] is typically a file object or URL for the composite image
    let generatedImage = null;
    
    if ((result as any).data && Array.isArray((result as any).data)) {
      const output = (result as any).data[1]; // Index 1 is the output png file
      generatedImage = output?.url || output?.path || output;
    }

    if (!generatedImage) {
        throw new Error('Failed to generate background-removed image');
    }

    return NextResponse.json({ success: true, image: generatedImage });

  } catch (error: any) {
    console.error('Error generating AI background:', error);

    // Refund the credit if we deducted it
    try {
      const cookieStore = await cookies();
      const activeShopId = cookieStore.get('active_shop_id')?.value;
      if (activeShopId) {
        await connectToDatabase();
        const shop = await Shop.findById(activeShopId);
        if (shop) {
          shop.aiCatalogCredits = (shop.aiCatalogCredits || 0) + 1;
          shop.totalAiCatalogsGenerated = Math.max(0, (shop.totalAiCatalogsGenerated || 0) - 1);
          await shop.save();
        }
      }
    } catch (refundError) {
      console.error('Failed to refund credit:', refundError);
    }

    const errorMessage = error.message?.includes('error occurred') 
      ? 'The free AI server is currently overloaded. Please try again in a few minutes.' 
      : error.message || 'Internal server error';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
