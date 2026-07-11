'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Maximize2 } from 'lucide-react';

interface ShopProfileModalProps {
  shopName: string;
  shopImage: string;
  activeShopId: string;
}

export default function ShopProfileModal({ shopName, shopImage, activeShopId }: ShopProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${shopName || 'shop'}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      {/* Clickable Profile Trigger */}
      <div 
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors"
        onClick={() => setIsOpen(true)}
      >
        {shopImage ? (
          <img src={shopImage} alt={shopName} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-sm">
            {shopName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden md:block text-sm">
          <p className="font-semibold text-gray-900 leading-tight">{shopName}</p>
          <p className="text-gray-500 text-xs">Shop Owner</p>
        </div>
      </div>

      {/* Modal Overlay */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => { setIsOpen(false); setQrExpanded(false); }}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>
            
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{shopName}</h2>
              
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-8">
                
                {/* QR Code Section (Left Side) */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                  <p className="font-semibold text-indigo-900 mb-4">Shop QR Code</p>
                  
                  {/* QR Code Canvas */}
                  <div 
                    ref={qrRef} 
                    className={`bg-white p-2 rounded-xl shadow-sm cursor-pointer transition-transform ${qrExpanded ? 'scale-125 my-4' : 'hover:scale-105'}`}
                    onClick={() => setQrExpanded(!qrExpanded)}
                    title="Click to enlarge"
                  >
                    <QRCodeCanvas 
                      value={`https://pasr.in/shops/${activeShopId || 'demo'}`} 
                      size={qrExpanded ? 200 : 120}
                      level="H"
                      includeMargin={true}
                      imageSettings={{
                        src: "/pasr.jpeg",
                        height: qrExpanded ? 48 : 28,
                        width: qrExpanded ? 48 : 28,
                        excavate: true,
                      }}
                    />
                    {!qrExpanded && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-white/40 backdrop-blur-[1px] transition-opacity rounded-xl">
                        <Maximize2 size={24} className="text-indigo-600" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-indigo-500 mt-2 text-center max-w-[150px]">
                    {qrExpanded ? "Click again to minimize" : "Click QR to enlarge"}
                  </p>

                  <button 
                    onClick={downloadQRCode}
                    className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200"
                  >
                    <Download size={18} />
                    Download QR
                  </button>
                </div>
                
                {/* Shop Image Section (Right Side) */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="font-semibold text-gray-700 mb-4">Shop Image</p>
                  {shopImage ? (
                    <div className="relative group rounded-2xl overflow-hidden shadow-sm w-full max-w-[240px] aspect-square">
                      <img 
                        src={shopImage} 
                        alt={shopName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-[240px] aspect-square rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-6xl shadow-sm">
                      {shopName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
