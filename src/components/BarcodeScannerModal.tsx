'use client';

import React, { useEffect, useState } from 'react';
import { X, Camera } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerModalProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScannerModal({ onScanSuccess, onClose }: BarcodeScannerModalProps) {
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    // We create the scanner inside useEffect
    const scanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // We can optionally log errors, but it gets spammy because it fails every frame it doesn't see a barcode
      }
    );

    return () => {
      // Cleanup
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Camera size={20} className="text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Scan Barcode</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4 text-center">Position the product's barcode inside the box to scan automatically.</p>
          <div id="reader" className="w-full rounded-xl overflow-hidden border-2 border-indigo-100 [&>div>video]:rounded-xl [&>div]:border-none"></div>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
