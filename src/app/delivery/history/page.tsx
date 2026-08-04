'use client';

import { useState, useEffect } from 'react';
import { History as HistoryIcon, Loader2, Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = async (currentSkip = 0, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/partner/delivery/history?skip=${currentSkip}`);
      const data = await res.json();
      if (data.success) {
        const newOrders = data.history || [];
        if (append) {
          setHistory(prev => [...prev, ...newOrders]);
        } else {
          setHistory(newOrders);
        }
        
        if (newOrders.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (e) {
      console.error('Failed to fetch history', e);
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const newSkip = skip + 20;
    setSkip(newSkip);
    fetchHistory(newSkip, true);
  };

  const refreshList = () => {
    setSkip(0);
    setHasMore(true);
    fetchHistory(0, false);
  };

  useEffect(() => {
    fetchHistory(0, false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <HistoryIcon className="text-indigo-600" /> Delivery History
          </h1>
          <p className="text-gray-500 text-sm mt-1">View your past completed and cancelled deliveries.</p>
        </div>
        <button onClick={refreshList} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
          Refresh List
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <HistoryIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No history available yet.</p>
          <p className="text-sm text-gray-400 mt-1">Complete deliveries to see them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="p-6 flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{order.orderId}</span>
                    {order.orderStatus === 'COMPLETED' ? (
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        <CheckCircle size={12} /> COMPLETED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-100 text-red-800 rounded-full">
                        <XCircle size={12} /> CANCELLED
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-green-600 text-lg">₹{order.partnerEarning || order.deliveryCharge}</p>
                </div>

                <div className="flex flex-col md:flex-row md:gap-8 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{order.distanceInKm} km total</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mt-2">
                  <p><strong className="text-gray-700">From:</strong> {order.shopId?.shopName || order.shopId?.owner?.name}</p>
                  <p><strong className="text-gray-700">To:</strong> {order.customerId?.name || 'Customer'} ({order.deliveryAddress})</p>
                  
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    {order.paymentType === 'COD' && order.orderStatus === 'COMPLETED' ? (
                      <p className="text-amber-700 font-bold text-sm bg-amber-50 p-2 rounded inline-block border border-amber-200 shadow-sm">
                        Amount Collected: ₹{Number(order.totalAmount || 0).toFixed(2)}
                      </p>
                    ) : order.paymentType === 'COD' && order.orderStatus === 'CANCELLED' ? (
                      <p className="text-red-600 font-semibold text-sm">
                        Amount Collected: ₹0.00 (Cancelled)
                      </p>
                    ) : (
                      <p className="text-emerald-700 font-semibold text-sm bg-emerald-50 p-2 rounded inline-block border border-emerald-200">
                        Paid Online - ₹0.00 Collected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {hasMore && history.length >= 20 && (
            <div className="flex justify-center mt-6 pt-4 pb-8">
              <button 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-indigo-50 text-indigo-700 px-6 py-2.5 rounded-full font-medium hover:bg-indigo-100 disabled:opacity-50 flex items-center gap-2 transition-colors border border-indigo-100 shadow-sm"
              >
                {loadingMore && <Loader2 className="animate-spin" size={16} />}
                {loadingMore ? 'Loading...' : 'Load 20 More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
