import { Truck, DollarSign, MapPin, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function DeliveryDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Delivery Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Track your active trips and daily earnings.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed Trips</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">12</h3>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <CheckCircle size={24} />
            </div>
          </div>
          <p className="text-emerald-600 text-sm font-medium mt-4 flex items-center gap-1">
            Today
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Deliveries</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">2</h3>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <Truck size={24} />
            </div>
          </div>
          <p className="text-amber-600 text-sm font-medium mt-4 flex items-center gap-1">
            Currently in progress
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Online Hours</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">4.5h</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mt-4 flex items-center gap-1">
            Active time today
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Earnings</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">₹850</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-xl text-green-600">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-emerald-600 text-sm font-medium mt-4 flex items-center gap-1">
            <TrendingUp size={16} /> +12% from yesterday
          </p>
        </div>
      </div>

      {/* Active Trip Map/List */}
      <div className="mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Current Active Trips</h2>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
              Go Offline
            </button>
          </div>
          
          {/* Mock Map / Active Area */}
          <div className="w-full h-64 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400">
            <MapPin size={48} className="mb-4 text-gray-300" />
            <p className="font-medium text-gray-500">Map Integration Coming Soon</p>
            <p className="text-sm">You are currently online and looking for orders.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
