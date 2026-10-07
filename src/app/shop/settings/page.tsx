'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Store, MapPin, Clock, FileText, IndianRupee, QrCode, Sparkles } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { SHOP_CATEGORIES } from '@/lib/categories';
import A4QrPosterModal from '@/components/A4QrPosterModal';

export default function ShopSettings() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showA4Poster, setShowA4Poster] = useState(false);
  
  const [settings, setSettings] = useState({
    shopName: '',
    shopDescription: '',
    category: '',
    location: '',
    openingTime: '',
    closingTime: '',
    upiId: '',
    gstNumber: '',
    activeShopId: ''
  });

  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `${settings.shopName || 'shop'}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/shop/settings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.shop) {
            setSettings({
              shopName: data.shop.shopName || '',
              shopDescription: data.shop.shopDescription || '',
              category: data.shop.category || 'Grocery',
              location: data.shop.location || '',
              openingTime: data.shop.openingTime || '09:00',
              closingTime: data.shop.closingTime || '21:00',
              upiId: data.shop.upiId || '',
              gstNumber: data.shop.gstNumber || '',
              activeShopId: data.activeShopId || ''
            });
          }
        }
      } catch (e) {
        console.error('Failed to fetch settings', e);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/shop/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Settings saved successfully!');
        // Refresh the page to update the header if shop name changed
        window.location.reload();
      } else {
        const data = await res.json();
        alert('Failed to save settings: ' + data.message);
      }
    } catch (error) {
      alert('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your shop profile, timings, and payment details.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Store size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
            
            {/* Shop QR Code Toggle/Download inside Basic Info Header */}
            {settings.activeShopId && (
              <div className="ml-auto flex items-center gap-3 border border-indigo-100 bg-indigo-50/50 p-2 pr-3 rounded-xl">
                <div ref={qrRef} className="bg-white p-1 rounded-lg shadow-sm">
                  <QRCodeCanvas 
                    value={`https://pasr.in/shops/${settings.activeShopId}`} 
                    size={52}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/pasr.jpeg",
                      height: 14,
                      width: 14,
                      excavate: true,
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-bold text-indigo-900">Shop QR Poster</p>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setShowA4Poster(true)}
                      className="text-[11px] px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Sparkles size={12} />
                      A4 Poster
                    </button>
                    <button 
                      type="button"
                      onClick={downloadQRCode}
                      className="text-[11px] px-2 py-1 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      QR Only
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* A4 QR Standee Poster Modal */}
          <A4QrPosterModal
            isOpen={showA4Poster}
            onClose={() => setShowA4Poster(false)}
            shopName={settings.shopName || 'Shop'}
            shopLocation={settings.location || 'Local Bazaar'}
            activeShopId={settings.activeShopId}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Name *</label>
              <input type="text" name="shopName" value={settings.shopName} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none transition-all" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Description</label>
              <textarea name="shopDescription" rows={3} value={settings.shopDescription} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none transition-all resize-none"></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select name="category" value={settings.category} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none transition-all">
                <option value="" disabled>Select Category</option>
                {Object.keys(SHOP_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location & Timings */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <MapPin size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Location & Timings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address *</label>
              <input type="text" name="location" value={settings.location} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 p-3 outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" /> Opening Time *
              </label>
              <input type="time" name="openingTime" value={settings.openingTime} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 p-3 outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" /> Closing Time *
              </label>
              <input type="time" name="closingTime" value={settings.closingTime} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 p-3 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Business & Payment Details */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <IndianRupee size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Payment & Business</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <IndianRupee size={16} className="text-gray-400" /> UPI ID
              </label>
              <input type="text" name="upiId" value={settings.upiId} onChange={handleChange} placeholder="yournumber@upi" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 p-3 outline-none transition-all" />
              <p className="text-xs text-gray-500 mt-1">This UPI ID will be used to receive payments.</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-gray-400" /> GST Number (Optional)
              </label>
              <input type="text" name="gstNumber" value={settings.gstNumber} onChange={handleChange} placeholder="Enter 15-digit GSTIN" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 p-3 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={20} />
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
