import { Sprout, DollarSign, PackageOpen, TrendingUp, ShoppingCart, Truck } from 'lucide-react';

export default function FarmerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Farmer Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your produce catalog and wholesale orders.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">0</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-xl text-green-600">
              <ShoppingCart size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium mt-4 flex items-center gap-1">
            No data yet
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Produce Listed</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">0</h3>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <Sprout size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium mt-4 flex items-center gap-1">
            Active crops available
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Pickups</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">0</h3>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <Truck size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium mt-4 flex items-center gap-1">
            Waiting for delivery partner
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">₹0</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium mt-4 flex items-center gap-1">
            No data yet
          </p>
        </div>
      </div>

      {/* Recent Orders & Produce */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button className="text-green-600 text-sm font-semibold hover:text-green-700">View All</button>
          </div>
          <div className="space-y-4">
            <div className="text-center py-10 text-gray-500">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>No recent orders found.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Your Produce</h2>
            <button className="text-green-600 text-sm font-semibold hover:text-green-700">Manage</button>
          </div>
          <div className="space-y-4">
            <div className="text-center py-10 text-gray-500">
              <PackageOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>You haven't added any produce yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
