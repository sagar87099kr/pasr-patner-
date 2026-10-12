import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BACKEND_URL } from '@/lib/config';

// Helper to decode HTML entities
function decodeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Clean and format text
function formatDescription(text: string): string {
  if (!text) return '';
  const decoded = decodeHtml(text);
  const words = decoded.split(' ').filter(Boolean);
  if (words.length > 45) {
    return words.slice(0, 45).join(' ') + '...';
  }
  return decoded;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const barcodeRaw = searchParams.get('barcode') || searchParams.get('code') || '';
    const barcode = barcodeRaw.trim();

    if (!barcode) {
      return NextResponse.json({ error: 'Missing barcode parameter' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('pasr_token')?.value;
    const activeShopId = cookieStore.get('active_shop_id')?.value;

    // Check if the shop already has this product registered in their catalogue
    if (activeShopId) {
      try {
        const shopRes = await fetch(`${BACKEND_URL}/api/shop/products?shopId=${activeShopId}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`,
            'Cookie': `pasr_token=${token || ''}; active_shop_id=${activeShopId}`
          }
        });
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          const cleanStr = (s: any) => String(s || '').trim().replace(/^\][a-z0-9]{2}/i, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const targetClean = cleanStr(barcode);
          const targetNorm = targetClean.replace(/^0+/, '');

          const existing = (shopData.products || []).find((p: any) => {
            const b1 = cleanStr(p.barcode);
            const b2 = cleanStr(p.product?.barcode);
            if (b1 && b1 === targetClean) return true;
            if (b2 && b2 === targetClean) return true;
            if (targetNorm && ((b1 && b1.replace(/^0+/, '') === targetNorm) || (b2 && b2.replace(/^0+/, '') === targetNorm))) return true;
            return false;
          });

          if (existing) {
            return NextResponse.json({
              success: true,
              found: true,
              alreadyRegistered: true,
              message: `This product is already registered in your shop catalogue as "${existing.name || existing.product?.name || 'Item'}". Please update the existing product instead of creating a duplicate.`,
              existingProduct: existing,
              product: {
                barcode: barcode,
                name: existing.name || existing.product?.name || '',
                price: existing.price,
                stock: existing.quantity,
                image: existing.img?.url || existing.image || '',
                category: existing.itemCategory || existing.category || ''
              }
            });
          }
        }
      } catch (checkErr) {
        console.warn('Error checking existing shop products for barcode:', checkErr);
      }
    }

    // 2. Query PASR Platform & Community Registry FIRST (Shop A's registered product, Master Products, etc.)
    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/shop/products/barcode?barcode=${encodeURIComponent(barcode)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
          'Cookie': `pasr_token=${token || ''}; active_shop_id=${activeShopId || ''}`
        },
        cache: 'no-store'
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        if (backendData.found && backendData.product) {
          return NextResponse.json({
            success: true,
            found: true,
            source: backendData.source || 'pasr_community',
            product: backendData.product
          });
        }
      }
    } catch (e) {
      console.warn('Error fetching product from PASR community by barcode:', e);
    }

    const cleanCodes = [
      barcode,
      barcode.replace(/^0+/, ''),
      barcode.padStart(13, '0')
    ].filter((v, i, a) => v.length >= 4 && a.indexOf(v) === i);

    const headers = {
      'User-Agent': 'PASR-Partner-App/2.0 (contact@pasr.in)',
      'Accept': 'application/json'
    };

    // 3. Fallback: Try Open Food Facts (v2 API then v0 API)
    for (const code of cleanCodes) {
      try {
        const offRes = await fetch(
          `https://world.openfoodfacts.org/api/v2/product/${code}?fields=product_name,product_name_en,product_name_hi,product_name_in,brands,brand_owner,image_url,image_front_url,image_front_small_url,selected_images,ingredients_text,ingredients_text_en,generic_name,generic_name_en,categories,categories_tags,quantity`,
          { headers, cache: 'no-store' }
        );

        if (offRes.ok) {
          const offData = await offRes.json();
          if (offData.status === 1 && offData.product) {
            const p = offData.product;
            let name = p.product_name || p.product_name_en || p.product_name_hi || p.product_name_in || p.generic_name || '';
            const brand = p.brands || p.brand_owner || '';

            if (brand && name && !name.toLowerCase().includes(brand.toLowerCase())) {
              name = `${brand} ${name}`;
            } else if (!name && brand) {
              name = brand;
            }

            const img = p.image_front_url || p.image_url || p.image_front_small_url || 
              p.selected_images?.front?.display?.en || p.selected_images?.front?.display?.[Object.keys(p.selected_images?.front?.display || {})[0]] || '';

            const descText = p.ingredients_text_en || p.ingredients_text || p.generic_name_en || p.generic_name || '';
            const description = formatDescription(descText);

            if (name || img) {
              return NextResponse.json({
                success: true,
                found: true,
                source: 'openfoodfacts',
                product: {
                  barcode: code,
                  name: decodeHtml(name),
                  brand: decodeHtml(brand),
                  image: img,
                  images: img ? [img] : [],
                  description,
                  quantity: p.quantity || '',
                  category: p.categories || ''
                }
              });
            }
          }
        }
      } catch (e) {
        console.error('Error fetching OpenFoodFacts v2:', e);
      }
    }

    // 2. Try Open Beauty Facts (for cosmetics, soaps, shampoo, toiletries)
    for (const code of cleanCodes) {
      try {
        const obfRes = await fetch(
          `https://world.openbeautyfacts.org/api/v2/product/${code}?fields=product_name,product_name_en,brands,image_url,image_front_url,ingredients_text,generic_name,categories,quantity`,
          { headers, cache: 'no-store' }
        );

        if (obfRes.ok) {
          const obfData = await obfRes.json();
          if (obfData.status === 1 && obfData.product) {
            const p = obfData.product;
            let name = p.product_name || p.product_name_en || p.generic_name || '';
            const brand = p.brands || '';

            if (brand && name && !name.toLowerCase().includes(brand.toLowerCase())) {
              name = `${brand} ${name}`;
            } else if (!name && brand) {
              name = brand;
            }

            const img = p.image_front_url || p.image_url || '';
            const descText = p.ingredients_text || p.generic_name || '';
            const description = formatDescription(descText);

            if (name || img) {
              return NextResponse.json({
                success: true,
                found: true,
                source: 'openbeautyfacts',
                product: {
                  barcode: code,
                  name: decodeHtml(name),
                  brand: decodeHtml(brand),
                  image: img,
                  images: img ? [img] : [],
                  description,
                  quantity: p.quantity || '',
                  category: p.categories || 'Personal Care'
                }
              });
            }
          }
        }
      } catch (e) {
        console.error('Error fetching OpenBeautyFacts:', e);
      }
    }

    // 3. Try Open Products Facts (for household items, electronics, toys, etc.)
    for (const code of cleanCodes) {
      try {
        const opfRes = await fetch(
          `https://world.openproductsfacts.org/api/v2/product/${code}?fields=product_name,product_name_en,brands,image_url,image_front_url,generic_name,categories`,
          { headers, cache: 'no-store' }
        );

        if (opfRes.ok) {
          const opfData = await opfRes.json();
          if (opfData.status === 1 && opfData.product) {
            const p = opfData.product;
            let name = p.product_name || p.product_name_en || p.generic_name || '';
            const brand = p.brands || '';

            if (brand && name && !name.toLowerCase().includes(brand.toLowerCase())) {
              name = `${brand} ${name}`;
            } else if (!name && brand) {
              name = brand;
            }

            const img = p.image_front_url || p.image_url || '';
            const description = formatDescription(p.generic_name || '');

            if (name || img) {
              return NextResponse.json({
                success: true,
                found: true,
                source: 'openproductsfacts',
                product: {
                  barcode: code,
                  name: decodeHtml(name),
                  brand: decodeHtml(brand),
                  image: img,
                  images: img ? [img] : [],
                  description,
                  category: p.categories || ''
                }
              });
            }
          }
        }
      } catch (e) {
        console.error('Error fetching OpenProductsFacts:', e);
      }
    }

    // 4. Try UPCitemdb Global Database
    for (const code of cleanCodes) {
      try {
        const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code)}`, {
          headers: {
            'User-Agent': 'PASR-Partner-App/2.0',
            'Accept': 'application/json'
          },
          cache: 'no-store'
        });

        if (upcRes.ok) {
          const upcData = await upcRes.json();
          if (upcData.items && upcData.items.length > 0) {
            const item = upcData.items[0];
            const name = item.title || item.name || '';
            const brand = item.brand || '';
            const img = item.images && item.images.length > 0 ? item.images[0] : '';
            const description = formatDescription(item.description || '');

            if (name) {
              return NextResponse.json({
                success: true,
                found: true,
                source: 'upcitemdb',
                product: {
                  barcode: code,
                  name: decodeHtml(name),
                  brand: decodeHtml(brand),
                  image: img,
                  images: item.images || (img ? [img] : []),
                  description,
                  category: item.category || 'General'
                }
              });
            }
          }
        }
      } catch (e) {
        console.error('Error fetching UPCitemdb:', e);
      }
    }

    // 5. Try MasterProduct & Community Database Search in Backend
    if (token) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/shop/products/search?q=${encodeURIComponent(barcode)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `pasr_token=${token}`
          }
        });

        if (backendRes.ok) {
          const backendData = await backendRes.json();
          if (backendData.suggestions && backendData.suggestions.length > 0) {
            const match = backendData.suggestions[0];
            const img = match.img?.url || match.image || '';
            return NextResponse.json({
              success: true,
              found: true,
              source: 'pasr_catalog',
              product: {
                barcode,
                productId: match._id,
                name: match.name,
                brand: match.brand || '',
                image: img,
                images: img ? [img] : [],
                description: match.description || '',
                category: match.category || ''
              }
            });
          }
        }
      } catch (e) {
        console.error('Error fetching MasterProduct by barcode:', e);
      }
    }

    // 6. If not found in open databases yet
    return NextResponse.json({
      success: true,
      found: false,
      message: 'New barcode detected. Please enter product name once to register it.'
    });

  } catch (error: any) {
    console.error('Error in barcode lookup API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
