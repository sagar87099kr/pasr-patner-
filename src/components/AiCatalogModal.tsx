import React, { useState } from 'react';
import { X, Sparkles, Upload, Loader2, IndianRupee, ImagePlus } from 'lucide-react';
import Image from 'next/image';

interface AiCatalogModalProps {
  onClose: () => void;
  onSuccess: (generatedImages: string[]) => void;
  aiCredits: number;
}

export default function AiCatalogModal({ onClose, onSuccess, aiCredits }: AiCatalogModalProps) {
  const [step, setStep] = useState<'upload' | 'generating' | 'review'>('upload');
  const [productType, setProductType] = useState<'clothing' | 'general'>('clothing');
  const [modelGender, setModelGender] = useState<'male' | 'female'>('male');
  const [rawImages, setRawImages] = useState<File[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, 4); // Max 4
      setRawImages(files);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (rawImages.length === 0) return;
    setStep('generating');
    setError('');
    
    try {
      const results: string[] = [];
      let visionData = null;
      
      const base64 = await toBase64(rawImages[0]); // Use first image for vision
      
      // Run vision API in parallel for the first image
      const visionPromise = fetch('/api/ai/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 })
      }).then(res => res.json()).catch(err => console.error("Vision AI failed", err));

      // Process each raw image (up to 4)
      for (const file of rawImages) {
        const fileBase64 = await toBase64(file);
        
        let res;
        if (productType === 'clothing') {
          res = await fetch('/api/ai/catalog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ garmentImageBase64: fileBase64, modelGender })
          });
        } else {
          res = await fetch('/api/ai/background', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: fileBase64 })
          });
        }
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate image');
        
        results.push(data.image);
      }
      
      const visionResult = await visionPromise;
      if (visionResult?.success) {
        visionData = visionResult.data;
      }
      
      setGeneratedImages(results);
      setSelectedImages(results); // Auto-select all by default
      
      // Store vision data on window temporarily to pass to the parent page
      (window as any).__aiVisionData = visionData;
      
      setStep('review');
    } catch (err: any) {
      setError(err.message);
      setStep('upload');
    }
  };

  const handleConfirm = () => {
    onSuccess(selectedImages);
    onClose();
  };

  const toggleSelect = (img: string) => {
    setSelectedImages(prev => 
      prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">AI Catalog Studio</h2>
            <p className="text-sm text-gray-500 font-medium">Credits Remaining: <span className="text-indigo-600 font-bold">{aiCredits}</span></p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm border border-red-100">
            {error}
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">1. Select Product Type</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setProductType('clothing')}
                  className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${productType === 'clothing' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="font-bold text-gray-800">Clothing</div>
                  <div className="text-xs text-gray-500 mt-1">Virtual Try-On on Models</div>
                </button>
                <button 
                  onClick={() => setProductType('general')}
                  className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${productType === 'general' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="font-bold text-gray-800">General Item</div>
                  <div className="text-xs text-gray-500 mt-1">Bangles, Electronics, etc.</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">2. Upload Raw Photos (Max 4)</label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500 font-medium">Click to upload photos</p>
                  <p className="text-xs text-gray-400">SVG, PNG, JPG (Max 4 files)</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
              </label>
              {rawImages.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {rawImages.map((file, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={URL.createObjectURL(file)} alt="" className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {productType === 'clothing' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">3. Select AI Model</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setModelGender('male')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${modelGender === 'male' ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="font-bold text-gray-800">Male Model</div>
                    <div className="text-sm text-gray-500">Indian, Professional Studio</div>
                  </button>
                  <button 
                    onClick={() => setModelGender('female')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${modelGender === 'female' ? 'border-pink-600 bg-pink-50 ring-4 ring-pink-100' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="font-bold text-gray-800">Female Model</div>
                    <div className="text-sm text-gray-500">Indian, Professional Studio</div>
                  </button>
                </div>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={rawImages.length === 0 || aiCredits <= 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Professional Photos
            </button>
            
            {aiCredits <= 0 && (
              <div className="text-center mt-4">
                <a href="/shop/ai-credits" className="text-indigo-600 font-bold hover:underline">Purchase more credits to continue</a>
              </div>
            )}
          </div>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Styling your product...</h3>
              <p className="text-gray-500">The AI is dressing the model in a professional studio.<br/>This usually takes 30-60 seconds.</p>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800">Select the best images to keep</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {generatedImages.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => toggleSelect(img)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${selectedImages.includes(img) ? 'border-indigo-600' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt="Generated" className="w-full h-48 object-cover" />
                  {selectedImages.includes(img) && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={handleConfirm}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all"
            >
              Continue with {selectedImages.length} Images
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
