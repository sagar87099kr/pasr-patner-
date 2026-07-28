'use client';

import { useState, useEffect } from 'react';
import { Truck, DollarSign, MapPin, Clock, CheckCircle, Loader2, Package, Check, Navigation } from 'lucide-react';

export default function DeliveryDashboard() {
  const [orderId, setOrderId] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [partner, setPartner] = useState<any>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [broadcastOrders, setBroadcastOrders] = useState<any[]>([]);
  const [upcomingOrders, setUpcomingOrders] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/partner/delivery/dashboard');
      const data = await res.json();
      if (data.success) {
        setPartner(data.partner);
        setActiveOrders(data.activeOrders || []);
        setBroadcastOrders(data.broadcastOrders || []);
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

  const verifyOtp = async () => {
    if (!orderId) return alert('Enter Order ID');
    if (!otp || otp.length < 4) return alert('Enter a valid 4-digit OTP');
    
    // Find the real MongoDB _id
    const targetOrder = activeOrders.find((o: any) => o.orderId === orderId || o._id === orderId);
    if (!targetOrder) return alert('Order not found in your active deliveries!');

    setVerifying(true);
    try {
      const res = await fetch('/api/partner/delivery/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: targetOrder._id, otp })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Order Completed Successfully! Payout has been credited.');
        setOrderId('');
        setOtp('');
        fetchDashboard();
      } else {
        alert(data.error || data.message || 'Invalid OTP');
      }
    } catch (e) {
      alert('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const acceptOrder = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/partner/delivery/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Order Accepted!');
        fetchDashboard();
      } else {
        alert(data.message || 'Failed to accept order');
      }
    } catch (e) {
      alert('Error accepting order');
    } finally {
      setActionLoading(null);
    }
  };

  const markPickedUp = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/partner/delivery/picked-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Marked as Picked Up!');
        fetchDashboard();
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch (e) {
      alert('Error updating status');
    } finally {
      setActionLoading(null);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Delivery Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {partner?.fullName || 'Partner'}.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/partner/delivery/toggle-status', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ isActive: !partner?.isActive })
                });
                const data = await res.json();
                if (data.success) {
                  fetchDashboard(); // Refresh to get the new status
                } else {
                  alert(data.message || 'Failed to update status');
                }
              } catch (e) {
                alert('An error occurred while updating status');
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              partner?.isActive ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                partner?.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {partner?.isActive ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed Trips</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{partner?.totalDeliveries || 0}</h3>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <CheckCircle size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium mt-4 flex items-center gap-1">
            Total Deliveries
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Deliveries</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{partner?.currentOrders || 0}</h3>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <Truck size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium mt-4 flex items-center gap-1">
            Currently in progress
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Payout</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">₹{partner?.pendingPayout || 0}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium mt-4 flex items-center gap-1">
            Ready to withdraw
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Earnings</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">₹{partner?.totalEarnings || 0}</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-xl text-green-600">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium mt-4 flex items-center gap-1">
            Lifetime earnings
          </p>
        </div>
      </div>

      {/* Complete Order via OTP */}
      {activeOrders.some(o => o.orderStatus === 'OUT_FOR_DELIVERY') && (
        <div className="mt-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Complete Delivery</h2>
              <p className="text-sm text-gray-500">Enter the Order ID and the OTP provided by the customer to mark the delivery as completed.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order ID" 
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input 
                type="text" 
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="4-digit OTP" 
                className="w-full md:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-lg tracking-widest font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={verifyOtp}
                disabled={verifying || otp.length < 4 || !orderId}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 min-w-[140px] flex justify-center items-center"
              >
                {verifying ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Trips */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="text-indigo-600" /> My Active Deliveries
        </h2>
        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">You don't have any active deliveries.</p>
            <p className="text-sm text-gray-400 mt-1">Accept a broadcast order to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
                <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
                  <span className="font-bold text-indigo-900">{order.orderId}</span>
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-200 text-indigo-800 rounded-full">
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-gray-100 p-2 rounded-full text-gray-500"><MapPin size={16} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pickup From</p>
                      <p className="font-medium text-gray-900">{order.shopId?.shopName || order.shopId?.owner?.name || 'Local Shop'}</p>
                      {order.shopId?.owner?.username && (
                        <p className="text-sm font-semibold mt-1">
                          <a href={`tel:${order.shopId.owner.username}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                            📞 {order.shopId.owner.username}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-indigo-100 p-2 rounded-full text-indigo-500"><Navigation size={16} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Deliver To</p>
                      <p className="font-medium text-gray-900">{order.customerId?.name || 'Customer'}</p>
                      {order.customerId?.username && (
                        <p className="text-sm font-semibold mt-1">
                          <a href={`tel:${order.customerId.username}`} className="text-indigo-600 hover:underline flex items-center gap-1">
                            📞 {order.customerId.username}
                          </a>
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">{order.deliveryAddress}</p>
                      
                      {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                        <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3 inline-block">
                          <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Amount to Collect</p>
                          <p className="font-black text-red-700 text-xl">
                            {order.paymentType === 'PREPAID' || order.paymentStatus === 'VERIFIED' ? '₹0' : `₹${order.totalAmount}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="font-bold text-gray-900">{order.distanceInKm} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Est. Earning</p>
                      <p className="font-bold text-green-600">₹{order.partnerEarning}</p>
                    </div>
                    {order.orderStatus === 'ASSIGNED' && (
                      <button 
                        onClick={() => markPickedUp(order._id)}
                        disabled={actionLoading === order._id}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                      >
                        {actionLoading === order._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Mark Picked Up
                      </button>
                    )}
                    {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                      <button 
                        onClick={() => {
                          setOrderId(order.orderId);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                      >
                        Enter OTP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Orders (Being Prepared) */}
      {upcomingOrders.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="text-sky-500" /> Upcoming Orders (Being Prepared)
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingOrders.map((order) => (
              <div key={order._id} className="bg-sky-50 rounded-2xl border border-sky-200 shadow-sm overflow-hidden opacity-90">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-1 rounded">PREPARING</span>
                      <span className="font-bold text-gray-900">{order.orderId} - {order.customerId?.name || order.customerName || 'Customer'}</span>
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
            ))}
          </div>
        </div>
      )}

      {/* Available/Broadcast Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-amber-500" /> Available Orders Nearby
          </h2>
          <button onClick={fetchDashboard} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
            Refresh List
          </button>
        </div>
        
        {broadcastOrders.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500 font-medium">No available orders at the moment.</p>
            <p className="text-sm text-gray-400 mt-1">New orders will appear here when shops broadcast them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {broadcastOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:border-amber-300 transition-colors">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">NEW</span>
                      <span className="font-bold text-gray-900">{order.orderId} - {order.customerId?.name || order.customerName || 'Customer'}</span>
                    </div>
                    <p className="font-bold text-green-600">Earn ₹{order.partnerEarning}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">From:</span> {order.shopId?.shopName || order.shopId?.owner?.name}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">To:</span> {order.deliveryAddress}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Distance:</span> {order.distanceInKm} km</p>
                  </div>
                  
                  <button 
                    onClick={() => acceptOrder(order._id)}
                    disabled={actionLoading === order._id || !partner?.isActive}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {actionLoading === order._id ? <Loader2 size={18} className="animate-spin" /> : 'Accept Delivery'}
                  </button>
                  {!partner?.isActive && (
                    <p className="text-xs text-red-500 text-center mt-2">You must be Online to accept orders.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
