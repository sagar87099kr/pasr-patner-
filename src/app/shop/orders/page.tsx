'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Check, X, Truck, PackageCheck, MapPin, Phone, Loader2 } from 'lucide-react';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('New Orders');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/shop/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (e) {
        console.error('Failed to fetch orders', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const tabs = ['New Orders', 'Accepted', 'Delivered', 'Cancelled', 'All'];

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'New Orders') return order.status === 'Pending' || order.status === 'CREATED';
    if (activeTab === 'All') return true;
    return order.status === activeTab;
  }).filter(order => 
    order.orderId?.toLowerCase().includes(search.toLowerCase()) || 
    order.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': 
      case 'CREATED': return 'bg-amber-100 text-amber-700';
      case 'Accepted': return 'bg-blue-100 text-blue-700';
      case 'Delivered': 
      case 'COMPLETED':
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'Cancelled': 
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) return alert('Enter a valid 4-digit OTP');
    setVerifying(true);
    try {
      const res = await fetch('/api/shop/orders/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id, otp })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Order Completed Successfully!');
        setSelectedOrder(null);
        setOtp('');
        // Refresh orders
        const ordersRes = await fetch('/api/shop/orders');
        if (ordersRes.ok) {
          const newData = await ordersRes.json();
          setOrders(newData.orders || []);
        }
      } else {
        alert(data.error || 'Invalid OTP');
      }
    } catch (e) {
      alert('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-500 text-sm mt-1">Track and manage customer orders.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Tabs & Search */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID or Customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-6 font-medium">Order ID / Time</th>
                <th className="p-6 font-medium">Customer Details</th>
                <th className="p-6 font-medium">Amount & Items</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6">
                    <p className="font-bold text-gray-900">{order.orderId}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.createdAt}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                    <div className="flex flex-col gap-1 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1"><Phone size={12}/> {order.customerPhone}</span>
                      <span className="flex items-center gap-1">
                        {order.deliveryType?.toLowerCase().includes('self') ? <PackageCheck size={12}/> : <Truck size={12}/>} 
                        {order.deliveryType}
                      </span>
                      {order.deliveryType?.toLowerCase().includes('delivery') && (
                        <span className="flex items-start gap-1 mt-0.5"><MapPin size={12} className="shrink-0 mt-0.5"/> <span className="line-clamp-1">{typeof order.deliveryAddress === 'string' ? order.deliveryAddress : 'Address hidden'}</span></span>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-gray-900 text-lg">₹{order.totalAmount}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.itemsCount} Items</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">{order.paymentType}</span>
                      {order.coinDiscount > 0 && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">-₹{order.coinDiscount} Coins</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                        title="View Details"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={18} />
                      </button>
                      {order.status === 'Pending' && (
                        <>
                          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Accept">
                            <Check size={18} />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                            <X size={18} />
                          </button>
                        </>
                      )}
                      {order.status === 'Accepted' && (
                        <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Mark as Packed">
                          <PackageCheck size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                <p className="text-sm text-gray-500 mt-1">ID: {selectedOrder.orderId}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Information</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2"><Phone size={14}/> {selectedOrder.customerPhone}</p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2"><MapPin size={14}/> {typeof selectedOrder.deliveryAddress === 'string' ? selectedOrder.deliveryAddress : 'Delivery Address hidden'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</h4>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">₹{item.price} × {item.quantity}</p>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic">No items found for this order.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
                <span>Total Items Value</span>
                <span>₹{selectedOrder.totalAmount + (selectedOrder.coinDiscount || 0)}</span>
              </div>
              
              {selectedOrder.selfDelivery ? (
                // Self Pickup Flow
                <>
                  <div className="flex items-center justify-between mb-2 text-sm text-yellow-600 font-medium">
                    <span>Coin Discount (Pasr will pay you)</span>
                    <span>-₹{selectedOrder.coinDiscount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Price to Take (from Customer)</span>
                    <span className="text-2xl font-extrabold text-indigo-600">₹{selectedOrder.totalAmount}</span>
                  </div>

                  {(selectedOrder.status === 'Pending' || selectedOrder.status === 'CREATED') && (
                    <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Customer OTP</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          maxLength={4}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Enter 4-digit OTP" 
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-lg tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                          onClick={verifyOtp}
                          disabled={verifying || otp.length < 4}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {verifying ? <Loader2 size={20} className="animate-spin" /> : 'Complete Order'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Delivery Flow
                <>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <span className="font-bold text-gray-900">Price Pasr Will Pay You</span>
                    <span className="text-2xl font-extrabold text-emerald-600">₹{selectedOrder.totalAmount + (selectedOrder.coinDiscount || 0)}</span>
                  </div>
                  <div className="mt-4">
                    <span className="inline-flex w-full justify-center px-4 py-2 rounded-xl text-sm font-bold bg-amber-50 text-amber-700 uppercase tracking-wider">
                      {selectedOrder.paymentType === 'COD' ? 'Delivery Partner Will Collect Cash' : `PAID ONLINE VIA ${selectedOrder.paymentType}`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
