'use client';

export default function Onboarding() {
  const options = [
    { title: 'List Your Shop', icon: '🏪', desc: 'Reach local customers easily.', link: '/onboarding/shop' },
    { title: 'Service Provider', icon: '🛠️', desc: 'Offer your professional services.', link: '/onboarding/service' },
    { title: 'Sell Farm Fresh', icon: '🚜', desc: 'Sell produce directly to consumers.', link: '/onboarding/farmer' },
    { title: 'Delivery Partner', icon: '🛵', desc: 'Earn money by delivering orders.', link: '/onboarding/delivery' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Choose Your Path</h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            How would you like to partner with PaSr? Select the category that best fits your business or service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {options.map((opt, i) => (
            <div 
              key={i} 
              onClick={() => window.location.href = opt.link}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform origin-left">{opt.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{opt.title}</h2>
              <p className="text-gray-500 mb-6">{opt.desc}</p>
              <div className="flex items-center text-indigo-600 font-bold group-hover:text-indigo-700">
                Get Started
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Already have an account? <a href="/" className="text-indigo-600 font-bold hover:underline">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
}
