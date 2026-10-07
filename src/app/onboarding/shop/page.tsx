'use client';

import { useState } from 'react';
import { Store, MapPin, Clock, FileText, Upload } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';
import { SHOP_CATEGORIES } from '@/lib/categories';

export default function ShopRegistration() {
  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    category: '',
    location: '',
    openingTime: '',
    closingTime: '',
    upiId: '',
    gstNumber: ''
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const categories = Object.keys(SHOP_CATEGORIES);

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? Math.min(100, Math.round((scrollTop / maxScroll) * 100)) : 100;
    setScrollProgress(progress);
    if (progress >= 95) {
      setTermsScrolled(true);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 1);
        setImagePreview(compressedBase64);
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      setError('Shop image is required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, shopImage: imagePreview })
      });

      if (res.ok) {
        // Automatically route them to the shop dashboard since they just registered
        const data = await res.json();
        
        // Mock set active profile
        await fetch('/api/auth/set-active-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: data.shopId || 'mock_shop_id', profileType: 'Shop Owner' })
        });
        
        window.location.href = '/shop';
      } else {
        const data = await res.json();
        setError(data.error || data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="bg-indigo-600 px-8 py-10 text-white text-center">
          <Store className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-extrabold tracking-tight">List Your Shop</h1>
          <p className="mt-2 text-indigo-100">Join our local marketplace and reach more customers.</p>
        </div>

        <div className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-medium border border-red-100">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Shop Name <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium" placeholder="E.g., Verma Sweets" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium bg-white">
                    <option value="">Select Category...</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea required rows={3} value={formData.shopDescription} onChange={e => setFormData({...formData, shopDescription: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium" placeholder="Tell customers about your shop..." />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Location & Timings</h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium" placeholder="Shop No, Street, Landmark" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Opening Time <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input required type="time" value={formData.openingTime} onChange={e => setFormData({...formData, openingTime: e.target.value})} className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Closing Time <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input required type="time" value={formData.closingTime} onChange={e => setFormData({...formData, closingTime: e.target.value})} className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Business Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">UPI ID <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium" placeholder="number@upi" />
                  
                  {formData.upiId.length > 4 && formData.upiId.includes('@') && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center transition-all animate-in fade-in zoom-in duration-300">
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Verify Your QR Code</p>
                      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${formData.upiId}&pn=${formData.shopName || 'Shop Owner'}`)}`} 
                          alt="UPI QR Code" 
                          className="w-28 h-28"
                        />
                      </div>
                      <p className="text-xs text-indigo-600 font-medium mt-3 text-center">Scan with any UPI app to confirm your details.</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">GST Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-medium uppercase" placeholder="22AAAAA0000A1Z5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Shop Image</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors">
                <input type="file" id="shop-image" className="hidden" accept="image/*" onChange={handleImageChange} />
                <label htmlFor="shop-image" className="cursor-pointer flex flex-col items-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-32 object-cover rounded-xl shadow-sm mb-3" />
                  ) : (
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-8 h-8 text-indigo-500" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-indigo-600">Click to upload shop image</span>
                  <span className="text-xs text-gray-500 mt-1">Any image format (auto-compressed)</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Merchant Agreement & Monthly Subscription *</span>
                </h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${termsScrolled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  {termsScrolled ? '✓ Agreement Reviewed' : 'Scroll to bottom'}
                </span>
              </div>

              {/* Scrollable Terms Container */}
              <div 
                onScroll={handleTermsScroll}
                className="max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 leading-relaxed space-y-3 shadow-inner"
              >
                {/* Summary Grid */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-indigo-700 text-xs mb-2">Key Policy & Subscription Highlights</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-500 block text-[11px] font-semibold">Platform Subscription</span>
                      <strong className="text-indigo-600">Monthly Storefront Plan</strong>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-500 block text-[11px] font-semibold">Billing Frequency</span>
                      <strong className="text-gray-900">Monthly Recurring / Invoiced</strong>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-500 block text-[11px] font-semibold">Settlement Cycle</span>
                      <strong className="text-gray-900">Direct UPI (T+1 Cycles)</strong>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-500 block text-[11px] font-semibold">Order Fulfillment SLA</span>
                      <strong className="text-gray-900">15 – 25 Mins Preparation</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-gray-900">1. PREAMBLE & APPLICABILITY</h5>
                  <p>This Merchant Listing and Service Level Agreement ("Agreement") constitutes a legally binding contract between PASR Platform (Perfectly Assured Service and Rentals) and the Merchant. By listing your shop on PASR, you agree to comply with all operating terms, quality guidelines, and fee policies.</p>
                </div>

                <div>
                  <h5 className="font-bold text-gray-900">2. STOREFRONT SUBSCRIPTION & MONTHLY SERVICE CHARGES</h5>
                  <p><strong>2.1 Monthly Platform Fee:</strong> To maintain an active digital storefront, list inventory, and receive local orders through PASR, the Merchant agrees to pay a monthly recurring platform subscription fee.</p>
                  <p><strong>2.2 Invoicing:</strong> Monthly charges are invoiced in advance at each monthly billing cycle and can be settled via UPI or deducted from accumulated settlement balances.</p>
                  <p><strong>2.3 Grace Period:</strong> A 5-day grace period is provided upon invoice generation. Unpaid accounts may be temporarily hidden from customer searches.</p>
                </div>

                <div>
                  <h5 className="font-bold text-gray-900">3. PRODUCT COMPLIANCE & PRICING FAIRNESS</h5>
                  <p>All items must be genuine, unexpired, and strictly sold at or below MRP. Counterfeit, banned, or hazardous goods are strictly forbidden.</p>
                </div>

                <div>
                  <h5 className="font-bold text-gray-900">4. ORDER PREPARATION & PACKAGING SLA</h5>
                  <p>Orders must be acknowledged within 5 minutes and packed in hygienic, tamper-proof packaging within 15–25 minutes for handover to PASR delivery executives.</p>
                </div>

                <div>
                  <h5 className="font-bold text-gray-900">5. UPI PAYOUTS & RECONCILIATIONS</h5>
                  <p>Payouts are credited electronically to the registered UPI ID after deducting customer returns, missing items, or authorized service charges.</p>
                </div>

                <div>
                  <h5 className="font-bold text-gray-900">6. GOVERNING LAW & JURISDICTION</h5>
                  <p>This Agreement is subject to Indian laws and the jurisdiction of courts in Giridih / Jharkhand, India.</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 transition-all duration-200 ${termsScrolled ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>

              {/* Locked Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input 
                  id="partnerTermsCheck" 
                  type="checkbox" 
                  required 
                  disabled={!termsScrolled}
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                />
                <label 
                  htmlFor="partnerTermsCheck" 
                  className={`text-xs text-gray-700 leading-snug select-none ${termsScrolled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                >
                  I have completely scrolled, read, understood, and formally agree to the PASR Merchant Terms of Service, Monthly Platform Subscription Agreement, and Operating Guidelines.
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button 
                disabled={loading || !termsAccepted} 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? 'Creating Profile...' : 'Complete Registration & List Shop'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
