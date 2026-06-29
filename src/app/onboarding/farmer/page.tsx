'use client';

import { useState } from 'react';
import { Tractor, MapPin, Phone, Upload } from 'lucide-react';

export default function FarmerRegistration() {
  const [formData, setFormData] = useState({
    farmName: '',
    location: '',
    phoneNumber: '',
    category: '',
    upiId: ''
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Vegetables', 'Fruits', 'Grains & Pulses', 'Dairy Products', 
    'Seeds & Fertilizers', 'Others'
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
      const res = await fetch('/api/auth/register-farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, farmImage: imagePreview })
      });

      if (res.ok) {
        const data = await res.json();
        
        await fetch('/api/auth/set-active-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: data.farmerId || 'mock_farmer_id', profileType: 'Farmer' })
        });
        
        window.location.href = '/farmer';
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
        
        <div className="bg-green-600 px-8 py-10 text-white text-center">
          <Tractor className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-extrabold tracking-tight">Sell Farm Fresh</h1>
          <p className="mt-2 text-green-100">Sell your produce directly to consumers and local bazaars.</p>
        </div>

        <div className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-medium border border-red-100">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Farm Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Farm Name / Your Name <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.farmName} onChange={e => setFormData({...formData, farmName: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium" placeholder="E.g., Verma Farms" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Produce Category <span className="text-red-500">*</span></label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium bg-white">
                    <option value="">Select Category...</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input required type="tel" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium" placeholder="10-digit number" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">UPI ID (For Payments) <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium" placeholder="number@upi" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Farm Location <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium" placeholder="Village or Full Address" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Farm Image</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors">
                <input type="file" id="farm-image" className="hidden" accept="image/*" onChange={handleImageChange} />
                <label htmlFor="farm-image" className="cursor-pointer flex flex-col items-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-32 object-cover rounded-xl shadow-sm mb-3" />
                  ) : (
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-8 h-8 text-green-500" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-green-600">Click to upload your image</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button disabled={loading} type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center">
                {loading ? 'Registering...' : 'Start Selling Produce'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
