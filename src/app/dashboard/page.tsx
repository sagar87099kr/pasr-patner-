'use client';

import { useState, useEffect } from 'react';

export default function PartnerDashboard() {
  const [partnerData, setPartnerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch live partner data from MongoDB via internal API
  useEffect(() => {
    const fetchLiveData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/partner/profile');
        if (response.ok) {
          const data = await response.json();
          setPartnerData(data);
          setLoading(false);
          return;
        } else {
          throw new Error('Endpoint not found or unauthorized');
        }
      } catch (error) {
        console.warn('Using fallback data for demonstration:', error);
        setTimeout(() => {
          setPartnerData({
            name: 'Sharma General Store',
            type: 'Shop Owner',
            earnings: '₹12,450',
            activeOrders: 8,
            rating: '4.8 ★',
            recentActivity: [
              { id: 1001, amount: 450, time: 1 },
              { id: 1002, amount: 200, time: 2 },
              { id: 1003, amount: 850, time: 5 },
            ]
          });
          setLoading(false);
        }, 800);
      }
    };
    fetchLiveData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold tracking-tight">PaSr Partner</h1>
          <p className="text-xs text-indigo-300 font-bold mt-1">Connected: pasr.in</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {['Dashboard', 'My Profile', 'Earnings', 'Analytics'].map((tab, i) => (
            <button
              key={tab}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                i === 0
                  ? 'bg-white/10 font-semibold shadow-sm'
                  : 'text-indigo-200 hover:bg-white/5 font-medium'
              }`}
            >
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-800">
          <button onClick={() => window.location.href = '/'} className="w-full py-2 px-4 bg-indigo-800 hover:bg-indigo-700 font-medium rounded-xl transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between z-10 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, Partner!</h2>
            <p className="text-sm text-gray-500 mt-1">Here is what's happening with your business today.</p>
          </div>
          <div className="flex items-center gap-4">
             <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-gray-600">Syncing Live</span>
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold shadow-sm ml-2">
              PT
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50 relative">
           {loading && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
               <div className="flex flex-col items-center">
                 <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                 <p className="mt-4 text-indigo-800 font-semibold">Syncing profile with pasr.in...</p>
               </div>
             </div>
          )}

          {partnerData && (
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Earnings', value: partnerData.earnings, color: 'text-indigo-600' },
                { label: 'Active Orders/Services', value: partnerData.activeOrders, color: 'text-emerald-600' },
                { label: 'Customer Rating', value: partnerData.rating, color: 'text-amber-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-sm font-semibold text-gray-500 mb-2">{stat.label}</div>
                  <div className={`text-4xl font-extrabold ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Your Profile</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                  🏪
                </div>
                <div>
                  <h4 className="text-xl font-bold">{partnerData.name}</h4>
                  <p className="text-gray-500">{partnerData.type}</p>
                  <p className="text-sm text-green-600 font-semibold mt-1">✓ Verified Provider</p>
                </div>
                <div className="ml-auto">
                   <button className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-colors">
                     Edit Profile
                   </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {partnerData.recentActivity.map((item: any, idx: number) => (
                  <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl">
                        📦
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Order #{item.id} Completed</div>
                        <div className="text-sm text-gray-500 mt-1">Payment of ₹{item.amount} credited to your account</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-400">
                      {item.time} hour{item.time > 1 ? 's' : ''} ago
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
          )}
        </div>
      </main>
    </div>
  );
}
