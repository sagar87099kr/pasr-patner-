'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function OrderPreparing() {
  const [upcomingOrders, setUpcomingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partner/delivery/dashboard');
      const data = await res.json();
      if (data.success) {
        setUpcomingOrders(data.upcomingOrders || []);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 tracking-tight">
          <Clock className="text-sky-500" /> Order Preparing
        </h1>
        <button onClick={fetchDashboard} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      ) : upcomingOrders.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500 font-medium">No orders are currently being prepared.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {upcomingOrders.map((order) => {
            const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }) : 'Time unknown';

            return (
              <div key={order._id} className="bg-sky-50 rounded-2xl border border-sky-200 shadow-sm overflow-hidden opacity-90">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-1 rounded">PREPARING</span>
                        <span className="font-bold text-gray-900">{order.orderId} - {order.customerId?.name || order.customerName || 'Customer'}</span>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{dateStr}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">From:</span> {order.shopId?.shopName || order.shopId?.owner?.name}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">To:</span> {order.deliveryAddress}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Distance:</span> {order.distanceInKm} km</p>
                  </div>
                  
                  <button 
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-500 py-3 rounded-xl font-bold transition-colors cursor-not-allowed"
                  >
                    Waiting for Shop
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
