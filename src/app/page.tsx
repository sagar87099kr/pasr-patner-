'use client';

import { useState } from 'react';

export default function PartnerLogin() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password })
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = '/select-profile';
      } else {
        setError(data.error || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left section: Info/Marketing */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2400&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            alt="Partner background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-900/80 to-transparent" />
        </div>
        <div className="relative z-10 text-white max-w-xl">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">Grow Your Business with PaSr</h1>
          <p className="text-xl text-indigo-200 mb-8 leading-relaxed">
            Join thousands of shops, service providers, farmers, and delivery partners who are growing their reach and revenue every day.
          </p>
          <div className="grid grid-cols-2 gap-6 mt-12">
            {[
              { title: 'Shop Owners', desc: 'List your products locally' },
              { title: 'Service Providers', desc: 'Offer your skills online' },
              { title: 'Farmers', desc: 'Sell farm fresh produce' },
              { title: 'Delivery Partners', desc: 'Earn on your schedule' }
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-indigo-200 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right section: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left flex flex-col items-center lg:items-start">
            <img src="/pasrpatner.png" alt="PaSr Partner Logo" className="h-16 w-auto mb-4 object-contain" />
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Partner Portal</h2>
            <p className="text-gray-500 mt-2 text-lg">Sign in to manage your business.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                placeholder="Enter your registered mobile number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <span className="ml-2 text-sm text-gray-600 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
