'use client';

import { useState } from 'react';
import { Save, Store, MapPin, Clock, FileText, IndianRupee } from 'lucide-react';

export default function ShopSettings() {
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Name *</label>
              <input type="text" defaultValue="Digamber Store" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none transition-all" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Description</label>
              <textarea rows={3} defaultValue="You can buy all type of grocery items in one place. With good Market rate." className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none transition-all resize-none"></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select defaultValue="Grocery" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 p-3 outline-none transition-all">
                <option value="Grocery">Grocery</option>
                <option value="General Store">General Store</option>
                <option value="Hardware">Hardware</option>
                <option value="Automobile">Automobile</option>
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
              <input type="text" defaultValue="Sh13, 825412, Doranda, Dhanwar, Giridih, Jharkhand, India" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 p-3 outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" /> Opening Time *
              </label>
              <input type="time" defaultValue="09:00" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 p-3 outline-none transition-all" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" /> Closing Time *
              </label>
              <input type="time" defaultValue="21:00" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 p-3 outline-none transition-all" />
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
                <IndianRupee size={16} className="text-gray-400" /> UPI ID *
              </label>
              <input type="text" placeholder="yournumber@upi" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 p-3 outline-none transition-all" />
              <p className="text-xs text-gray-500 mt-1">This UPI ID will be used to receive payments.</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-gray-400" /> GST Number (Optional)
              </label>
              <input type="text" placeholder="Enter 15-digit GSTIN" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-amber-500 focus:border-amber-500 p-3 outline-none transition-all" />
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
