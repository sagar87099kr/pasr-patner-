import { ShoppingCart } from 'lucide-react';

export default function FarmerOrders() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your wholesale and customer orders here.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500">When you receive orders for your produce, they will appear here.</p>
      </div>
    </div>
  );
}
