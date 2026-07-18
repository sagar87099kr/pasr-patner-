'use client';

import { useState } from 'react';
import { Save, Loader2, Building, MapPin, Briefcase, FileText } from 'lucide-react';

export default function SettingsClient({ initialData, activeProviderId }: { initialData: any, activeProviderId: string | undefined }) {
  const [formData, setFormData] = useState({
    company: initialData?.company || '',
    discription: initialData?.discription || '',
    experience: initialData?.experience || '',
    categories: initialData?.categories || '',
    location: initialData?.location || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProviderId) {
      setMessage({ type: 'error', text: 'No active provider found. Please try logging in again.' });
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/provider/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      
      setMessage({ type: 'success', text: 'Profile settings updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!initialData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Data Unavailable</h2>
        <p className="text-gray-500">We couldn't fetch your profile data. Ensure you are logged in.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
          
          {/* Company Name */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Building size={16} className="mr-2 text-indigo-500" />
              Business / Company Name
            </label>
            <input 
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              placeholder="Enter your business name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Briefcase size={16} className="mr-2 text-indigo-500" />
                Category
              </label>
              <select 
                name="categories"
                value={formData.categories}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="Farming Vehicles">Farming Vehicles</option>
                <option value="Four Wheelers">Four Wheelers</option>
                <option value="HMV (Bus)">HMV (Bus)</option>
                <option value="Three Wheelers">Three Wheelers</option>
                <option value="Caterings">Caterings</option>
                <option value="Filming">Filming</option>
                <option value="Decoration">Decoration</option>
                <option value="DJ and Tent">DJ and Tent</option>
                <option value="Band Party">Band Party</option>
                <option value="Home Service provider">Home Service provider</option>
                <option value="Heavy Equipments">Heavy Equipments</option>
                <option value="Labour and Mistry">Labour and Mistry</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <span className="mr-2 text-indigo-500 font-bold text-lg leading-none">★</span>
                Years of Experience
              </label>
              <input 
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                placeholder="Years"
                min="0"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={16} className="mr-2 text-indigo-500" />
              Full Address / Location
            </label>
            <input 
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              placeholder="Enter full address for map pin"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <FileText size={16} className="mr-2 text-indigo-500" />
              Business Description
            </label>
            <textarea 
              name="discription"
              value={formData.discription}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-y"
              placeholder="Tell customers about your services..."
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isSaving ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
