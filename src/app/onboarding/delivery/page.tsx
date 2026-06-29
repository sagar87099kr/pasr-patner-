'use client';

import { useState, useEffect } from 'react';
import { Truck, MapPin, Phone, FileText, Upload, User } from 'lucide-react';

export default function DeliveryRegistration() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    aadhaar: '',
    location: '',
    vehicleType: '',
    drivingLicense: '',
    upiId: ''
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [aadhaarImagePreview, setAadhaarImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch pre-filled details from backend
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setFormData(prev => ({
            ...prev,
            fullName: data.user.name || '',
            phoneNumber: data.user.phone || '',
            location: data.user.address || ''
          }));
        }
      })
      .catch(err => console.error('Failed to fetch user details', err));
  }, []);

  const vehicleTypes = [
    'Two Wheeler', 'Three Wheeler', 'Four Wheeler', 'Bicycle'
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

  const handleAadhaarImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadhaarImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.vehicleType !== 'Bicycle' && formData.vehicleType !== '' && !formData.drivingLicense) {
      setError('Driving license is required if you are using a motorized vehicle.');
      return;
    }
    if (!imagePreview || !aadhaarImagePreview) {
      setError('Profile selfie and Aadhaar card photos are required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.drivingLicense || "N/A",
        address: formData.location,
        aadharNumber: formData.aadhaar,
        panNumber: "0000",
        dateOfBirth: "1990-01-01",
        profileImage: imagePreview,
        aadhaarImage: aadhaarImagePreview
      };

      const res = await fetch('/api/auth/register-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        
        await fetch('/api/auth/set-active-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: data.deliveryId || 'mock_delivery_id', profileType: 'Delivery Partner' })
        });
        
        window.location.href = '/delivery';
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
        
        <div className="bg-amber-500 px-8 py-10 text-white text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-extrabold tracking-tight">Become a Delivery Partner</h1>
          <p className="mt-2 text-amber-50">Deliver orders locally and earn money on your schedule.</p>
        </div>

        <div className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-medium border border-red-100">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium" placeholder="E.g., Rahul Kumar" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input required type="tel" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium disabled:bg-gray-100" placeholder="10-digit number" disabled />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Aadhaar No. <span className="text-red-500">*</span></label>
                  <input required type="text" value={formData.aadhaar} onChange={e => setFormData({...formData, aadhaar: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium" placeholder="12-digit Aadhaar" maxLength={12} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">City / Base Location <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium" placeholder="City where you'll deliver" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Payout Details</h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">UPI ID <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium" placeholder="e.g., number@upi" />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Vehicle Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Type <span className="text-red-500">*</span></label>
                  <select required value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium bg-white">
                    <option value="">Select Vehicle...</option>
                    {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Driving License No. {formData.vehicleType !== 'Bicycle' && <span className="text-red-500">*</span>}</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input required={formData.vehicleType !== 'Bicycle'} type="text" value={formData.drivingLicense} onChange={e => setFormData({...formData, drivingLicense: e.target.value})} className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium uppercase" placeholder="License Number" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Selfie / Photo Verification</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors">
                <input type="file" id="delivery-image" className="hidden" accept="image/*" onChange={handleImageChange} />
                <label htmlFor="delivery-image" className="cursor-pointer flex flex-col items-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-32 object-cover rounded-xl shadow-sm mb-3" />
                  ) : (
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-8 h-8 text-amber-500" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-amber-600">Upload clear selfie/photo</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Aadhaar Card Photo</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors">
                <input type="file" id="aadhaar-image" className="hidden" accept="image/*" onChange={handleAadhaarImageChange} />
                <label htmlFor="aadhaar-image" className="cursor-pointer flex flex-col items-center">
                  {aadhaarImagePreview ? (
                    <img src={aadhaarImagePreview} alt="Preview" className="h-32 object-cover rounded-xl shadow-sm mb-3" />
                  ) : (
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-8 h-8 text-amber-500" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-amber-600">Upload Aadhaar photo</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button disabled={loading} type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center">
                {loading ? 'Registering...' : 'Register as Delivery Partner'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
