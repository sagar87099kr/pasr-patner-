'use client';

import { useState, useEffect } from 'react';

export default function SelectProfile() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    const checkProfiles = async () => {
      try {
        const res = await fetch('/api/partner/my-profiles');
        if (res.ok) {
          const data = await res.json();
          const userProfiles = data.profiles || [];
          
          if (userProfiles.length === 0) {
            // User has 0 profiles. Show them the onboarding right away.
            window.location.href = '/onboarding';
            return;
          } else if (userProfiles.length === 1) {
            // In a real app we'd save the profile ID to context/localstorage here
            const pType = userProfiles[0].type;
            const pId = userProfiles[0]._id;
            
            await fetch('/api/auth/set-active-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ profileId: pId, profileType: pType })
            });

            if (pType === 'Shop Owner') {
              window.location.href = '/shop';
            } else if (pType === 'Service Provider') {
              window.location.href = '/provider';
            } else if (pType === 'Farmer') {
              window.location.href = '/farmer';
            } else if (pType === 'Delivery Partner') {
              window.location.href = '/delivery';
            } else {
              window.location.href = '/dashboard';
            }
            return;
          } else {
            // User has multiple profiles. Map the MongoDB documents to the UI format.
            const mappedProfiles = userProfiles.map((p: any) => ({
              id: p._id,
              type: p.category || p.type,
              name: p.businessName || p.name || 'My Business',
              icon: p.category === 'DELIVERY' ? '🛵' : '🏪'
            }));
            setProfiles(mappedProfiles);
            setLoading(false);
          }
        } else {
          // If unauthenticated or error, go back to login
          window.location.href = '/';
        }
      } catch (e) {
        console.error('Error fetching profiles', e);
        setLoading(false);
      }
    };
    
    checkProfiles();
  }, []);

  const handleSelect = async (profileId: string, profileType: string) => {
    try {
      await fetch('/api/auth/set-active-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, profileType })
      });
      
      if (profileType === 'Shop Owner') {
        window.location.href = '/shop';
      } else if (profileType === 'Service Provider') {
        window.location.href = '/provider';
      } else if (profileType === 'Farmer') {
        window.location.href = '/farmer';
      } else if (profileType === 'Delivery Partner') {
        window.location.href = '/delivery';
      } else {
        window.location.href = '/dashboard';
      }
    } catch(e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-800 font-semibold">Checking your partner profiles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Select Profile</h2>
          <p className="text-gray-500 mt-2">Which business do you want to manage today?</p>
        </div>

        <div className="space-y-4">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleSelect(profile.id, profile.type)}
              className="w-full flex items-center p-4 border border-gray-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
            >
              <div className="text-4xl mr-4 group-hover:scale-110 transition-transform origin-center">
                {profile.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">
                  {profile.type}
                </h3>
                <p className="text-sm text-gray-500">{profile.name}</p>
              </div>
              <div className="ml-auto text-gray-300 group-hover:text-indigo-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <button 
            onClick={() => window.location.href = '/onboarding'} 
            className="w-full bg-white border-2 border-indigo-100 hover:border-indigo-200 text-indigo-700 font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Become a Partner Today
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Register a new shop, service, farm, or become a delivery rider.
          </p>
        </div>
      </div>
    </div>
  );
}
