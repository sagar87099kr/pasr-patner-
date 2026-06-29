'use client';

import { useState } from 'react';
import { Store, MapPin, Clock, FileText, Upload } from 'lucide-react';

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

  const categories = [
    'Automobile', 'Bakery', 'Beauty/Cosmetics', 'Coaching', 'Dhaba', 'Electronics',
    'Fashion', 'Footwear', 'Furniture', 'General Store', 'Grocery', 'Hardware',
    'Jewelers', 'Medical', 'Mobile Shop', 'Non-Veg', 'Printing & Digital',
    'Restaurant', 'Salon', 'Seeds & Fertilizers', 'Sports', 'Stationery',
    'Sweet Shop', 'Vegetables & Fruits', 'Wholesale', 'Others'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center">
                {loading ? 'Creating Profile...' : 'Complete Registration'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
