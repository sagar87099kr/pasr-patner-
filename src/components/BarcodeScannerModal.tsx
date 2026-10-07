'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, Keyboard, Upload, Zap, ZapOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface BarcodeScannerModalProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScannerModal({ onScanSuccess, onClose }: BarcodeScannerModalProps) {
  const [mode, setMode] = useState<'camera' | 'manual' | 'upload'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string>('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef<boolean>(false);
  const readerElementId = 'barcode-scanner-viewport';

  // Handle successful scan
  const handleSuccess = useCallback(async (decodedText: string) => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
    } catch (e) {
      console.warn('Error stopping scanner on success', e);
    }
    onScanSuccess(decodedText.trim());
  }, [onScanSuccess]);

  // Start Camera
  const startCamera = useCallback(async (cameraId?: string) => {
    try {
      setError('');
      setIsCameraReady(false);

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          verbose: false
        });
      }

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      // Get available cameras if not loaded
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          if (!cameraId && !selectedCameraId) {
            // Prefer back/environment camera
            const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment'));
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          }
        }
      } catch (camErr) {
        console.warn('Unable to query camera list', camErr);
      }

      const cameraConfig = cameraId 
        ? { deviceId: { exact: cameraId } } 
        : { facingMode: 'environment' };

      await scannerRef.current.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxWidth = Math.floor(minEdge * 0.85);
            const qrboxHeight = Math.floor(qrboxWidth * 0.65);
            return { width: Math.max(250, qrboxWidth), height: Math.max(160, qrboxHeight) };
          },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleSuccess(decodedText);
        },
        () => {
          // Frame scan error - ignore spam
        }
      );

      setIsCameraReady(true);
      
      // Check if torch/flashlight is supported
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities();
        if (capabilities && (capabilities as any).torch) {
          setHasTorch(true);
        }
      } catch (tErr) {
        setHasTorch(false);
      }

    } catch (err: any) {
      console.error('Failed to start camera', err);
      setIsCameraReady(false);
      setError(
        err.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please allow camera access in your browser settings or use manual entry.'
          : 'Unable to start camera stream. You can switch camera or enter barcode manually.'
      );
    }
  }, [handleSuccess, selectedCameraId]);

  // Initialize camera when mode is 'camera'
  useEffect(() => {
    if (mode === 'camera') {
      const timer = setTimeout(() => {
        startCamera(selectedCameraId);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Stop camera when switched to other modes
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {}).then(() => {
          scannerRef.current?.clear();
        });
      }
    }
  }, [mode, selectedCameraId, startCamera]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(e => console.warn('Clean up stop err', e)).then(() => {
            scannerRef.current?.clear();
          });
        } else {
          try {
            scannerRef.current.clear();
          } catch (e) {}
        }
      }
    };
  }, []);

  // Toggle Torch
  const toggleTorch = async () => {
    if (!scannerRef.current || !scannerRef.current.isScanning) return;
    try {
      const newTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: newTorch } as any]
      });
      setTorchOn(newTorch);
    } catch (e) {
      console.warn('Torch toggle failed', e);
    }
  };

  // Switch Camera
  const switchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCameraId(cameras[nextIndex].id);
  };

  // Handle image file upload scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId);
      }
      const decoded = await scannerRef.current.scanFile(file, true);
      if (decoded) {
        handleSuccess(decoded);
      }
    } catch (err: any) {
      console.error('File scan error', err);
      setError('No barcode detected in this image. Please try a clearer picture or enter manually.');
    }
  };

  // Manual code submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      setError('Please enter a barcode number');
      return;
    }
    handleSuccess(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Scan Barcode</h3>
              <p className="text-xs text-gray-500">Auto-fill product information</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 p-1.5 mx-5 mt-4 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'camera' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera size={14} />
            Live Scan
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'manual' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Keyboard size={14} />
            Type Code
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'upload' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload size={14} />
            Upload Photo
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col items-center">
          
          {/* CAMERA MODE */}
          <div className={`w-full flex flex-col items-center ${mode === 'camera' ? 'block' : 'hidden'}`}>
            <p className="text-xs text-gray-500 mb-3 text-center">
              Align the product barcode within the scanning frame
            </p>

            <div className="relative w-full aspect-square max-h-[300px] rounded-2xl overflow-hidden bg-black border-2 border-indigo-200 shadow-inner flex items-center justify-center">
              
              {/* HTML5 QR Container */}
              <div 
                id={readerElementId} 
                className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
              />

              {/* Viewfinder Overlay */}
              {isCameraReady && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-3/4 h-1/2 border-2 border-indigo-400/80 rounded-xl relative overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                    {/* Laser scanning animation */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-[bounce_2s_infinite]" />
                    
                    {/* Reticle corner marks */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-indigo-400" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-indigo-400" />
                  </div>
                </div>
              )}

              {/* Camera Controls Overlay */}
              {isCameraReady && (
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 pointer-events-auto">
                  {hasTorch && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                        torchOn ? 'bg-amber-400 text-gray-900 shadow-lg' : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                      title="Toggle Flashlight"
                    >
                      {torchOn ? <Zap size={16} /> : <ZapOff size={16} />}
                    </button>
                  )}
                  {cameras.length > 1 && (
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all"
                      title="Switch Camera"
                    >
                      <RefreshCw size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MANUAL INPUT MODE */}
          {mode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="w-full py-4 space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm font-semibold text-gray-800">Enter Barcode / UPC / EAN</p>
                <p className="text-xs text-gray-500 mt-0.5">Type the 8, 12, or 13 digit number printed under the barcode</p>
              </div>

              <div>
                <input
                  type="text"
                  autoFocus
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.replace(/\s+/g, ''))}
                  placeholder="e.g. 8901491101837"
                  className="w-full text-center text-xl tracking-wider font-mono font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 focus:border-indigo-600 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-400 placeholder:text-base placeholder:font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-indigo-100"
              >
                Lookup Barcode
              </button>
            </form>
          )}

          {/* UPLOAD IMAGE MODE */}
          {mode === 'upload' && (
            <div className="w-full py-4 flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-4 text-center">
                Upload a photo or clear image showing the product barcode
              </p>

              <label className="w-full aspect-[4/3] max-h-[220px] rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 flex flex-col items-center justify-center p-4 cursor-pointer transition-all">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
                  <Upload size={22} />
                </div>
                <span className="text-sm font-bold text-indigo-950">Choose Barcode Photo</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="w-full mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">
                <p>{error}</p>
                {mode === 'camera' && (
                  <button
                    type="button"
                    onClick={() => setMode('manual')}
                    className="mt-1 font-bold underline hover:text-red-900"
                  >
                    Switch to Manual Entry
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Supports EAN-13, UPC, Code 128 & QR</span>
          <button 
            type="button" 
            onClick={onClose} 
            className="font-bold text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
