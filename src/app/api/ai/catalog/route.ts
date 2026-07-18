import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { client } from '@gradio/client';
import connectToDatabase from '@/lib/mongoose';
import { Shop } from '@/models/Shop';

export const maxDuration = 300; // 5 minutes (Vercel hobby plan allows 10s, pro 300s, but Next.js local doesn't care)

// Preset Indian models for IDM-VTON
const PRESET_MODELS = {
  male: "https://raw.githubusercontent.com/yisol/IDM-VTON/main/example/person/00010_00.jpg", 
  female: "https://raw.githubusercontent.com/yisol/IDM-VTON/main/example/person/00055_00.jpg"
};

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const activeShopId = cookieStore.get('active_shop_id')?.value;
    
    if (!activeShopId) {
      return NextResponse.json({ error: 'No active shop selected' }, { status: 401 });
    }

    const { garmentImageBase64, modelGender = 'male' } = await req.json();

    if (!garmentImageBase64) {
      return NextResponse.json({ error: 'Garment image is required' }, { status: 400 });
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

    // 2. Connect to Hugging Face IDM-VTON space
    // Convert base64 to Blob
    const response = await fetch(garmentImageBase64);
    const garmentBlob = await response.blob();
    
    // Fetch preset model image blob
    const modelImageUrl = PRESET_MODELS[modelGender as keyof typeof PRESET_MODELS] || PRESET_MODELS.male;
    const modelImageRes = await fetch(modelImageUrl);
    const modelBlob = await modelImageRes.blob();

    // Use Gradio Client to call yisol/IDM-VTON
    const app = await client("yisol/IDM-VTON");
    
    // Gradio Endpoint: /tryon
    // Parameters might vary slightly based on the HF space version, but generally:
    // [dict(background, layers, composite), image(garment), string(prompt), bool(is_checked), bool(is_checked), int(denoise_steps), int(seed)]
    
    // As of latest IDM-VTON gradio space:
    // 0: {"background": file, "layers": [], "composite": null} (Person image)
    // 1: file (Garment image)
    // 2: text (Garment description / prompt)
    // 3: bool (Yes/No - use auto-masking)
    // 4: bool (Yes/No - use auto-crop)
    // 5: number (Denoising steps)
    // 6: number (Seed)
    
    const result = await app.predict("/tryon", [
      { background: modelBlob, layers: [], composite: null }, 
      garmentBlob, 
      "Professional studio photography, high fashion, high quality", 
      true, 
      true, 
      30, 
      42
    ]);

    // The result is usually an array containing the generated image info
    // result.data[0] is typically the URL or file object
    const generatedImage = (result as any).data[0]?.url || (result as any).data[0];

    return NextResponse.json({ success: true, image: generatedImage });

  } catch (error: any) {
    console.error('Error generating AI catalog:', error);

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
