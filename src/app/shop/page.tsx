'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ShoppingCart, 
  Clock,
  CheckCircle2,
  Tag,
  MapPin,
  XCircle,
  Banknote,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function ShopDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestPayoutLoading, setRequestPayoutLoading] = useState(false);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    tableContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleRequestPayout = async () => {
    setRequestPayoutLoading(true);
    try {
      const res = await fetch('/api/shop/request-payout', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || 'Payout requested successfully.');
        window.location.reload();
      } else {
        alert(data.error || data.message || 'Failed to request payout.');
      }
    } catch (e) {
      alert('An error occurred while requesting payout.');
    } finally {
      setRequestPayoutLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, ordersRes, dashboardRes] = await Promise.all([
          fetch('/api/shop/products'),
          fetch('/api/shop/orders'),
          fetch('/api/shop/dashboard')
        ]);
        
        if (productsRes.ok) {
          const pData = await productsRes.json();
          setProducts(pData.products || []);
        }

        if (ordersRes.ok) {
          const oData = await ordersRes.json();
          setOrders(oData.orders || []);
        }

        if (dashboardRes.ok) {
          const dData = await dashboardRes.json();
          setDashboard(dData.dashboard || null);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => ['Pending', 'Processing', 'CREATED', 'ACCEPTED', 'READY_FOR_DELIVERY', 'BROADCAST', 'ASSIGNED', 'OUT_FOR_DELIVERY'].includes(o.status || o.orderStatus));
  const completedOrdersList = orders.filter(o => ['Completed', 'Delivered', 'COMPLETED'].includes(o.status || o.orderStatus));
  const cancelledOrders = orders.filter(o => ['Cancelled', 'CANCELLED'].includes(o.status || o.orderStatus));
  
  const unsettledOrders = completedOrdersList.filter(o => o.settlementStatus === 'PENDING');
  const paymentToReceive = unsettledOrders.reduce((sum, order) => {
    let earningsForShop = 0;
    const isSelfPickup = !!order.selfDelivery || order.deliveryType === 'Self Pickup' || order.deliveryType === 'SELF_PICKUP' || order.deliveryType === 'SHOP_PICKUP';
    const actualItemPrice = order.subtotalAmount || ((order.totalAmount || 0) + (order.coinDiscount || 0));

    if (isSelfPickup) {
        earningsForShop = order.coinDiscount || 0;
    } else {
        earningsForShop = actualItemPrice;
    }

    return sum + earningsForShop;
  }, 0);

  const todaysOrdersList = orders.filter(o => {
    if (!o.createdAt && !o.orderDate) return false;
    try {
      const orderDate = new Date(o.createdAt || o.orderDate);
      return orderDate.toDateString() === new Date().toDateString();
    } catch(e) { return false; }
  });

  const totalAmountSellToday = dashboard?.totalAmountSellToday ?? todaysOrdersList.reduce((sum, order) => {
    if (['Cancelled', 'CANCELLED'].includes(order.status || order.orderStatus)) return sum;
    const actualItemPrice = order.subtotalAmount || ((order.totalAmount || 0) + (order.coinDiscount || 0));
    return sum + actualItemPrice;
  }, 0);

  const thisMonthOrdersList = orders.filter(o => {
    if (!o.createdAt && !o.orderDate) return false;
    try {
      const orderDate = new Date(o.createdAt || o.orderDate);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } catch(e) { return false; }
  });

  const totalAmountSellThisMonth = dashboard?.totalAmountSellThisMonth ?? thisMonthOrdersList.reduce((sum, order) => {
    if (['Cancelled', 'CANCELLED'].includes(order.status || order.orderStatus)) return sum;
    const actualItemPrice = order.subtotalAmount || ((order.totalAmount || 0) + (order.coinDiscount || 0));
    return sum + actualItemPrice;
  }, 0);

  const metrics = [
    { 
      title: "Active Orders", 
      value: loading ? "..." : activeOrders.length.toString(), 
      icon: Clock, color: "text-amber-600", bg: "bg-amber-100", link: "/shop/orders?filter=active",
      hasNotification: activeOrders.length > 0 
    },
    { title: "Completed Orders", value: loading ? "..." : completedOrdersList.length.toString(), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", link: "/shop/orders?filter=completed" },
    { title: "Total Products", value: loading ? "..." : products.length.toString(), icon: Package, color: "text-purple-600", bg: "bg-purple-100", link: "/shop/products" },
    { 
      title: "Today's Sales", 
      value: loading ? "..." : `₹${totalAmountSellToday.toFixed(2)}`, 
      icon: Banknote, color: "text-blue-600", bg: "bg-blue-100", link: "/shop/orders" 
    },
    { 
      title: "This Month's Sales", 
      value: loading ? "..." : `₹${totalAmountSellThisMonth.toFixed(2)}`, 
      icon: Banknote, color: "text-indigo-600", bg: "bg-indigo-100", link: "/shop/orders" 
    },
    { 
      title: "Payment to Receive", 
      value: loading ? "..." : `₹${paymentToReceive.toFixed(2)}`, 
      icon: Banknote, color: "text-green-600", bg: "bg-green-100", 
      link: "#",
      action: paymentToReceive > 0 ? { label: requestPayoutLoading ? 'Requesting...' : 'Request Money', onClick: handleRequestPayout, disabled: requestPayoutLoading } : null
    },
  ];

  // Generate last 7 days chart data
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d,
      dateString: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      sales: 0,
      coinDiscount: 0,
      orders: 0
    };
  });

  completedOrdersList.forEach(order => {
    if (!order.createdAt && !order.orderDate) return;
    try {
      const orderDate = new Date(order.createdAt || order.orderDate);
      const dayData = last7DaysData.find(d => 
        d.date.getDate() === orderDate.getDate() && 
        d.date.getMonth() === orderDate.getMonth() &&
        d.date.getFullYear() === orderDate.getFullYear()
      );
      if (dayData) {
        const actualItemPrice = order.subtotalAmount || ((order.totalAmount || 0) + (order.coinDiscount || 0));
        dayData.sales += actualItemPrice;
        dayData.coinDiscount += (order.coinDiscount || 0);
        dayData.orders += 1;
      }
    } catch (e) {}
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Here is what is happening with your shop today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div 
              key={i} 
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-left w-full relative flex flex-col justify-between h-full"
            >
              <button 
                onClick={() => {
                  if (metric.link === '#') return;
                  if (metric.link.startsWith('#')) {
                    document.querySelector(metric.link)?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    router.push(metric.link);
                  }
                }}
                className="focus:outline-none w-full text-left"
              >
                {metric.hasNotification && (
                  <span className="absolute top-6 right-6 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${metric.bg} flex items-center justify-center`}>
                    <Icon className={metric.color} size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-gray-500 text-sm font-medium">{metric.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
              </button>
              
              {metric.action && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <button 
                    onClick={metric.action.onClick}
                    disabled={metric.action.disabled}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {metric.action.disabled && <Loader2 className="w-4 h-4 animate-spin" />}
                    {metric.action.label}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Banknote size={20} className="text-indigo-600" /> Sales Overview (Last 7 Days)
        </h2>
        <div className="h-72 w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : last7DaysData.every(d => d.sales === 0) ? (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <Banknote className="w-12 h-12 text-gray-300" />
              <p>No sales data for the last 7 days.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="dateString" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any) => [`₹${value.toFixed(2)}`, name === 'sales' ? 'Sales' : 'Coin Discount']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="sales" name="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="coinDiscount" name="coinDiscount" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div id="payment-history" className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600" /> Payment History (Pasr Settlements)
          </h2>
          {paymentToReceive > 0 && (
            <button 
              onClick={handleRequestPayout}
              disabled={requestPayoutLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            >
              {requestPayoutLoading ? 'Requesting...' : 'Request Payout'}
            </button>
          )}
        </div>
        <div className="hidden md:flex justify-end pt-2 pb-2 px-6 bg-white">
           <p className="text-xs text-indigo-400 italic font-medium">Drag horizontally to scroll history &rarr;</p>
        </div>
        <div 
          ref={tableContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        >
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="bg-gray-50/50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-6 font-medium">Order ID / Date</th>
                <th className="p-6 font-medium">Total Sales Amount</th>
                <th className="p-6 font-medium">Pasr Pays (Coin Discount)</th>
                <th className="p-6 font-medium">Pasr Pays (Home Delivery)</th>
                <th className="p-6 font-medium">Total Pasr Will Pay</th>
                <th className="p-6 font-medium">Order Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">Loading payment history...</td>
                </tr>
              ) : completedOrdersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">No completed orders for payment history yet.</td>
                </tr>
              ) : (
                completedOrdersList.map((order) => {
                  const isSelfPickup = !!order.selfDelivery || order.deliveryType === 'Self Pickup' || order.deliveryType === 'SELF_PICKUP' || order.deliveryType === 'SHOP_PICKUP';
                  const actualPrice = order.subtotalAmount || ((order.totalAmount || 0) + (order.coinDiscount || 0));
                  const coinDiscount = order.coinDiscount || 0;
                  
                  let totalPasrWillPay = 0;
                  let pasrPaysHomeDelivery = 0;
                  
                  if (isSelfPickup) {
                      totalPasrWillPay = coinDiscount;
                      pasrPaysHomeDelivery = 0;
                  } else {
                      totalPasrWillPay = actualPrice;
                      pasrPaysHomeDelivery = totalPasrWillPay - coinDiscount;
                  }

                  if (pasrPaysHomeDelivery < 0) pasrPaysHomeDelivery = 0;
                  if (totalPasrWillPay < 0) totalPasrWillPay = 0;

                  const orderTypeStr = isSelfPickup ? 'Self Pickup' : (order.paymentType === 'COD' ? 'COD Delivery' : 'Prepaid Delivery');

                  return (
                    <tr key={order._id || order.id || order.orderId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                        <p className="font-bold text-gray-900">{order.orderId}</p>
                        <p className="text-xs text-gray-500 mt-1">{order.createdAt}</p>
                      </td>
                      <td className="p-6 font-bold text-gray-900">
                        ₹{actualPrice}
                      </td>
                      <td className="p-6 font-bold text-yellow-600">
                        ₹{coinDiscount}
                      </td>
                      <td className="p-6 font-bold text-blue-600">
                        ₹{pasrPaysHomeDelivery}
                      </td>
                      <td className="p-6 font-bold text-indigo-600">
                        ₹{totalPasrWillPay}
                        <div className="text-[10px] text-gray-500 font-normal mt-1 flex items-center gap-1">
                           {(!order.settlementStatus || order.settlementStatus === 'PENDING') && <><Clock size={10} className="text-amber-500"/> Pending</>}
                           {order.settlementStatus === 'REQUESTED' && <><Loader2 size={10} className="text-blue-500 animate-spin"/> Requested</>}
                           {order.settlementStatus === 'SETTLED' && <><CheckCircle2 size={10} className="text-emerald-500"/> Settled</>}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold uppercase ${isSelfPickup ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {orderTypeStr}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
