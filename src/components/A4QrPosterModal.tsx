'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Printer, Sparkles, CheckCircle2, Truck, Tag, ShoppingBag, Receipt, ShieldCheck } from 'lucide-react';

interface A4QrPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  shopLocation?: string;
  activeShopId: string;
  shopImage?: string;
}

export default function A4QrPosterModal({
  isOpen,
  onClose,
  shopName,
  shopLocation,
  activeShopId,
  shopImage
}: A4QrPosterModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const posterPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const shopUrl = `https://pasr.in/shops/${activeShopId || 'demo'}`;
  const displayLocation = shopLocation || 'Local Bazaar';

  // High-Resolution A4 Canvas Generator (2480 x 3508 px at 300 DPI)
  const downloadA4Poster = async () => {
    setIsGenerating(true);
    try {
      const qrCanvas = qrRef.current?.querySelector('canvas');
      if (!qrCanvas) {
        alert('QR code is still loading. Please wait a second.');
        setIsGenerating(false);
        return;
      }

      const canvas = document.createElement('canvas');
      const width = 2480;
      const height = 3508;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Background (Clean White with gradient border)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Outer Gradient Border
      const borderGradient = ctx.createLinearGradient(0, 0, width, height);
      borderGradient.addColorStop(0, '#4F46E5'); // Indigo
      borderGradient.addColorStop(0.5, '#7C3AED'); // Purple
      borderGradient.addColorStop(1, '#2563EB'); // Blue

      ctx.lineWidth = 40;
      ctx.strokeStyle = borderGradient;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      // Inner Accent Line
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#E0E7FF';
      ctx.strokeRect(70, 70, width - 140, height - 140);

      // 2. Top Header Header Bar (Indigo)
      const headerGrad = ctx.createLinearGradient(0, 80, width, 400);
      headerGrad.addColorStop(0, '#3730A3');
      headerGrad.addColorStop(1, '#4338CA');
      ctx.fillStyle = headerGrad;
      ctx.beginPath();
      ctx.roundRect(100, 100, width - 200, 320, 40);
      ctx.fill();

      // Top Tagline & PASR Brand
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FBBF24'; // Amber-400
      ctx.font = 'bold 50px sans-serif';
      ctx.fillText('🛍️ PASR • AAPKA DIGITAL BAZAAR', width / 2, 190);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 82px sans-serif';
      ctx.fillText('SCAN KAREIN • GHAR BAITHE MANGAEIN', width / 2, 290);

      ctx.fillStyle = '#E0E7FF';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('Order Online from this Shop • Fast Delivery to Your Doorstep', width / 2, 365);

      // 3. Shop Identity Box
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(160, 470, width - 320, 320, 35);
      ctx.fill();
      ctx.stroke();

      // Verified Badge
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText('✓ PASR VERIFIED STORE PARTNER', width / 2, 545);

      // Shop Name (Truncate if excessively long)
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 88px sans-serif';
      const cleanShopName = shopName.length > 28 ? shopName.slice(0, 26) + '...' : shopName;
      ctx.fillText(cleanShopName, width / 2, 650);

      // Shop Location
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText(`📍 ${displayLocation}`, width / 2, 735);

      // 4. Center QR Standee Box
      const qrBoxWidth = 1400;
      const qrBoxHeight = 1480;
      const qrBoxX = (width - qrBoxWidth) / 2;
      const qrBoxY = 840;

      // Drop shadow for QR Card
      ctx.shadowColor = 'rgba(79, 70, 229, 0.18)';
      ctx.shadowBlur = 60;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 25;

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxWidth, qrBoxHeight, 50);
      ctx.fill();
      ctx.stroke();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // "SCAN ME / स्कैन करें" Ribbon at Top of QR Card
      ctx.fillStyle = '#4F46E5';
      ctx.beginPath();
      ctx.roundRect(qrBoxX + 250, qrBoxY - 35, qrBoxWidth - 500, 90, 30);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 48px sans-serif';
      ctx.fillText('⚡ SCAN ME • स्कैन करें ⚡', width / 2, qrBoxY + 28);

      // Draw QR Code onto Canvas
      const qrSize = 1000;
      const qrX = (width - qrSize) / 2;
      const qrY = qrBoxY + 120;
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

      // Supported UPI / Camera Banner inside QR Card
      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.roundRect(qrBoxX + 60, qrBoxY + qrBoxHeight - 260, qrBoxWidth - 120, 200, 25);
      ctx.fill();

      ctx.fillStyle = '#1E293B';
      ctx.font = '900 44px sans-serif';
      ctx.fillText('📱 Scan with Any Camera or UPI App', width / 2, qrBoxY + qrBoxHeight - 165);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('Google Pay  •  PhonePe  •  Paytm  •  WhatsApp  •  Camera', width / 2, qrBoxY + qrBoxHeight - 95);

      // 5. Four Value Proposition Cards (What customer gets by scanning)
      const propBoxY = 2380;
      const cardW = 1040;
      const cardH = 290;
      const gapX = 80;
      const leftColX = (width - (cardW * 2 + gapX)) / 2;
      const rightColX = leftColX + cardW + gapX;

      const drawValueCard = (x: number, y: number, iconEmoji: string, titleEn: string, titleHi: string, desc: string, accentColor: string) => {
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(x, y, cardW, cardH, 25);
        ctx.fill();
        ctx.stroke();

        // Left accent bar
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.roundRect(x + 5, y + 20, 14, cardH - 40, 7);
        ctx.fill();

        ctx.textAlign = 'left';
        // Icon
        ctx.font = '54px sans-serif';
        ctx.fillText(iconEmoji, x + 45, y + 90);

        // Title
        ctx.fillStyle = '#0F172A';
        ctx.font = '900 44px sans-serif';
        ctx.fillText(titleEn, x + 130, y + 75);

        // Hindi Subtitle
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText(titleHi, x + 130, y + 130);

        // Description
        ctx.fillStyle = '#475569';
        ctx.font = '500 32px sans-serif';
        ctx.fillText(desc, x + 45, y + 210);
      };

      // Card 1: Fast Delivery
      drawValueCard(
        leftColX, propBoxY,
        '🛵',
        'SUPERFAST HOME DELIVERY',
        'घर बैठे तुरंत डिलीवरी पाएं',
        'Direct doorstep delivery in 30-45 mins from this shop.',
        '#4F46E5'
      );

      // Card 2: Store Deals & Offers
      drawValueCard(
        rightColX, propBoxY,
        '💰',
        'EXCLUSIVE OFFERS & DISCOUNTS',
        'विशेष छूट एवं मुफ़्त डिलीवरी ऑफर्स',
        'Enjoy special store discounts & free delivery benefits.',
        '#059669'
      );

      // Card 3: 1000+ Items Catalog
      drawValueCard(
        leftColX, propBoxY + cardH + 40,
        '🛒',
        'FULL STORE CATALOG ONLINE',
        'दुकान का पूरा सामान लाइव देखें',
        'Explore 1000+ items with updated daily prices & live stock.',
        '#D97706'
      );

      // Card 4: WhatsApp Bills & Easy Pay
      drawValueCard(
        rightColX, propBoxY + cardH + 40,
        '🧾',
        'DIGITAL BILLS & EASY COD',
        'व्हाट्सएप बिल व कैश ऑन डिलीवरी',
        'Pay via Cash on Delivery or UPI with WhatsApp receipt.',
        '#7C3AED'
      );

      // 6. Footer Section
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 42px sans-serif';
      ctx.fillText('PASR • Local Shopping Made Simple & Fast', width / 2, 3180);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('Order anytime at www.pasr.in  •  Customer Support Helpline: 7979082525', width / 2, 3250);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('Printed for Store Display • Authorized by PASR Technologies', width / 2, 3310);

      // Download Image as PNG
      const link = document.createElement('a');
      link.download = `${(shopName || 'shop').replace(/\s+/g, '-').toLowerCase()}-A4-standee-poster.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      alert('Error generating A4 poster: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Print
  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      
      {/* Hidden Offscreen High-Res Canvas Helper */}
      <div className="hidden">
        <div ref={qrRef}>
          <QRCodeCanvas
            value={shopUrl}
            size={1000}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "/pasr.jpeg",
              height: 220,
              width: 220,
              excavate: true,
            }}
          />
        </div>
      </div>

      {/* Modal Card */}
      <div className="relative bg-slate-900 text-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                A4 Printable Store QR Standee Poster
              </h2>
              <p className="text-xs text-slate-400">
                Print in A4 size & stick at your shop counter for instant online customer orders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: A4 Poster Preview */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col items-center bg-slate-950">
          
          {/* Printable A4 Container Frame */}
          <div 
            ref={posterPrintRef}
            id="printable-a4-standee"
            className="w-full max-w-[540px] bg-white text-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center border-4 border-indigo-600 relative select-none"
            style={{
              aspectRatio: '1 / 1.414', // Standard A4 Aspect Ratio
            }}
          >
            {/* Top Brand Banner */}
            <div className="w-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 text-white rounded-xl p-3.5 text-center shadow-md mb-4">
              <span className="text-[10px] md:text-xs font-black text-amber-300 tracking-wider uppercase block">
                🛍️ PASR • AAPKA DIGITAL BAZAAR
              </span>
              <h1 className="text-sm md:text-lg font-black tracking-tight leading-tight mt-0.5">
                SCAN KAREIN • GHAR BAITHE MANGAEIN
              </h1>
              <p className="text-[9px] md:text-[11px] text-indigo-100 font-semibold mt-0.5">
                Order Online from our Shop • Fast Home Delivery
              </p>
            </div>

            {/* Shop Identity Box */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center mb-3">
              <span className="text-[9px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                <CheckCircle2 size={11} /> PASR VERIFIED STORE PARTNER
              </span>
              <h2 className="text-sm md:text-base font-black text-slate-900 leading-tight truncate px-2">
                {shopName}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                📍 {displayLocation}
              </p>
            </div>

            {/* QR Standee Card */}
            <div className="w-full max-w-[280px] bg-white border-2 border-indigo-500 rounded-2xl p-3 shadow-lg flex flex-col items-center relative my-1">
              <div className="absolute -top-3 bg-indigo-600 text-white text-[9px] font-extrabold px-3 py-0.5 rounded-full shadow">
                ⚡ SCAN ME • स्कैन करें ⚡
              </div>

              <div className="my-1.5 p-1 bg-white rounded-xl">
                <QRCodeCanvas
                  value={shopUrl}
                  size={170}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/pasr.jpeg",
                    height: 38,
                    width: 38,
                    excavate: true,
                  }}
                />
              </div>

              {/* Supported Apps */}
              <div className="w-full bg-slate-100 rounded-lg p-1.5 text-center mt-1">
                <p className="text-[8.5px] font-extrabold text-slate-800">
                  📱 Scan with Any Camera / UPI App
                </p>
                <p className="text-[7.5px] font-semibold text-slate-500">
                  Google Pay • PhonePe • Paytm • WhatsApp • Camera
                </p>
              </div>
            </div>

            {/* 4 Feature Bullet Grid (What customer gets) */}
            <div className="w-full grid grid-cols-2 gap-2 mt-3 text-left">
              
              <div className="bg-slate-50 border border-indigo-100 rounded-lg p-2 flex flex-col justify-center">
                <div className="flex items-center gap-1 text-indigo-700 font-extrabold text-[9px] leading-tight">
                  <Truck size={12} className="shrink-0" />
                  <span>FAST HOME DELIVERY</span>
                </div>
                <span className="text-[8px] font-bold text-indigo-900 mt-0.5">घर बैठे तुरंत डिलीवरी पाएं</span>
                <span className="text-[7.5px] text-slate-500 leading-tight">30-45 mins delivery to your home</span>
              </div>

              <div className="bg-slate-50 border border-emerald-100 rounded-lg p-2 flex flex-col justify-center">
                <div className="flex items-center gap-1 text-emerald-700 font-extrabold text-[9px] leading-tight">
                  <Tag size={12} className="shrink-0" />
                  <span>SPECIAL STORE OFFERS</span>
                </div>
                <span className="text-[8px] font-bold text-emerald-900 mt-0.5">विशेष छूट एवं बचत ऑफर्स</span>
                <span className="text-[7.5px] text-slate-500 leading-tight">Best market rates & discounts</span>
              </div>

              <div className="bg-slate-50 border border-amber-100 rounded-lg p-2 flex flex-col justify-center">
                <div className="flex items-center gap-1 text-amber-700 font-extrabold text-[9px] leading-tight">
                  <ShoppingBag size={12} className="shrink-0" />
                  <span>1000+ ITEMS ONLINE</span>
                </div>
                <span className="text-[8px] font-bold text-amber-900 mt-0.5">दुकान का पूरा सामान लाइव देखें</span>
                <span className="text-[7.5px] text-slate-500 leading-tight">Live inventory & stock prices</span>
              </div>

              <div className="bg-slate-50 border border-purple-100 rounded-lg p-2 flex flex-col justify-center">
                <div className="flex items-center gap-1 text-purple-700 font-extrabold text-[9px] leading-tight">
                  <Receipt size={12} className="shrink-0" />
                  <span>DIGITAL BILL & COD</span>
                </div>
                <span className="text-[8px] font-bold text-purple-900 mt-0.5">व्हाट्सएप बिल व कैश ऑन डिलीवरी</span>
                <span className="text-[7.5px] text-slate-500 leading-tight">Pay by COD or UPI easily</span>
              </div>

            </div>

            {/* Footer */}
            <div className="w-full mt-auto pt-3 border-t border-slate-200 text-center">
              <p className="text-[8.5px] font-extrabold text-slate-800">
                PASR • Local Shopping Made Simple • www.pasr.in
              </p>
              <p className="text-[7.5px] text-slate-400">
                Helpline: 7979082525 • Authorized PASR Partner Store Standee
              </p>
            </div>

          </div>

        </div>

        {/* Footer Action Bar */}
        <div className="p-4 md:p-5 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            📐 Generated in exact <strong className="text-white">A4 Print Dimensions (300 DPI)</strong> with bold customer instructions.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors border border-slate-700"
            >
              <Printer size={16} />
              <span>Print A4 Poster</span>
            </button>

            <button
              type="button"
              onClick={downloadA4Poster}
              disabled={isGenerating}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              <Download size={16} />
              <span>{isGenerating ? 'Generating A4 Poster...' : 'Download A4 Poster (PNG)'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Print Specific CSS to ensure exact A4 page fit */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-a4-standee, #printable-a4-standee * {
            visibility: visible !important;
          }
          #printable-a4-standee {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 30px !important;
            margin: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

    </div>,
    document.body
  );
}
