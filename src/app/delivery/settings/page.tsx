'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Loader2, Save, User, MapPin, Bike } from 'lucide-react';

export default function SettingsPage() {
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    vehicleType: '',
    vehicleNumber: ''
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partner/delivery/dashboard');
      const data = await res.json();
      if (data.success && data.partner) {
        setPartner(data.partner);
        setFormData({
          fullName: data.partner.fullName || '',
          address: data.partner.address || '',
          vehicleType: data.partner.vehicleType || '',
          vehicleNumber: data.partner.vehicleNumber || ''
        });
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/partner/delivery/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Settings updated successfully!');
        setPartner(data.partner);
      } else {
        alert(data.message || 'Failed to update settings');
      }
    } catch (error) {
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="text-indigo-600" /> Account Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage your delivery partner profile and vehicle details.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50">
          <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-2xl">
            {partner?.fullName?.charAt(0) || 'P'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{partner?.fullName || 'Delivery Partner'}</h2>
            <p className="text-sm text-gray-500">Phone: +91 {partner?.phoneNumber || 'N/A'}</p>
            <span className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${partner?.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {partner?.isApproved ? 'Approved Partner' : 'Pending Approval'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-md font-bold text-gray-900 flex items-center gap-2">
              <User size={18} className="text-gray-400" /> Personal Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address / Work Location</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-md font-bold text-gray-900 flex items-center gap-2">
              <Bike size={18} className="text-gray-400" /> Vehicle Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Bike">Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="EV">EV / Electric Vehicle</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  placeholder="e.g. BR01AB1234"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
