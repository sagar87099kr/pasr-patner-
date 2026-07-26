'use client';

import { useState } from 'react';

export default function PartnerLogin() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register Modal States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regStep, setRegStep] = useState<1 | 2>(1); // 1: Info, 2: OTP
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1: Mobile, 2: OTP & New Password
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password })
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      if (response.ok) {
        window.location.href = '/select-profile';
      } else {
        setError(data.error || data.message || 'Login failed');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Register Handlers
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, mobile: regMobile, password: regPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegStep(2);
      } else {
        setRegError(data.error || data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setRegError('Network error. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: regOtp, name: regName, mobile: regMobile, password: regPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = '/onboarding';
      } else {
        setRegError(data.error || data.message || 'OTP verification failed');
      }
    } catch (err: any) {
      setRegError('Network error. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: forgotMobile })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForgotStep(2);
      } else {
        setForgotError(data.error || data.message || 'Mobile number not found');
      }
    } catch (err: any) {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: forgotMobile, otp: forgotOtp, newPassword: forgotNewPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotMobile('');
        setForgotOtp('');
        setForgotNewPassword('');
        setSuccessMsg('Password updated successfully! Please sign in with your new password.');
      } else {
        setForgotError(data.error || data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative">
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
            {successMsg && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-semibold border border-green-200">
                {successMsg}
              </div>
            )}
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
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStep(1);
                  setForgotError('');
                }}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </button>
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

          {/* New User Register Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 font-medium mb-3">Don't have an account?</p>
            <button
              type="button"
              onClick={() => {
                setShowRegisterModal(true);
                setRegStep(1);
                setRegError('');
              }}
              className="w-full bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Create New Account & Partner
            </button>
          </div>
        </div>
      </div>

      {/* REGISTER MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ✕
            </button>

            {regStep === 1 ? (
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Create Account</h3>
                <p className="text-sm text-gray-500 mb-6">Enter your details to register as a new user.</p>

                {regError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100">{regError}</div>}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all mt-2 disabled:opacity-70 flex justify-center items-center"
                  >
                    {regLoading ? 'Sending OTP...' : 'Send OTP via SMS'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Verify OTP</h3>
                <p className="text-sm text-gray-500 mb-6">Enter 6-digit OTP sent to <b>{regMobile}</b></p>

                {regError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100">{regError}</div>}

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">6-Digit OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-extrabold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all mt-2 disabled:opacity-70 flex justify-center items-center"
                  >
                    {regLoading ? 'Verifying...' : 'Verify OTP & Onboard'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    className="w-full text-sm font-bold text-gray-500 hover:text-gray-700 text-center py-2"
                  >
                    ← Back to Details
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ✕
            </button>

            {forgotStep === 1 ? (
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Reset Password</h3>
                <p className="text-sm text-gray-500 mb-6">Enter your registered mobile number to receive an OTP.</p>

                {forgotError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100">{forgotError}</div>}

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={forgotMobile}
                      onChange={(e) => setForgotMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all mt-2 disabled:opacity-70 flex justify-center items-center"
                  >
                    {forgotLoading ? 'Sending OTP...' : 'Send OTP via SMS'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">Set New Password</h3>
                <p className="text-sm text-gray-500 mb-6">Enter OTP sent to <b>{forgotMobile}</b> and your new password.</p>

                {forgotError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100">{forgotError}</div>}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">6-Digit OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-extrabold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all mt-2 disabled:opacity-70 flex justify-center items-center"
                  >
                    {forgotLoading ? 'Updating Password...' : 'Reset Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="w-full text-sm font-bold text-gray-500 hover:text-gray-700 text-center py-2"
                  >
                    ← Back
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
