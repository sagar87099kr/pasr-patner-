'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  ShoppingCart, 
  Clock,
  CheckCircle2,
  Tag,
  MapPin
} from 'lucide-react';

export default function ShopDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  const newOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing' || o.status === 'CREATED');
  const completedOrdersList = orders.filter(o => o.status === 'Completed' || o.status === 'Delivered' || o.status === 'COMPLETED');
  
  const unsettledOrders = completedOrdersList.filter(o => o.settlementStatus !== 'SETTLED');
  const paymentToReceive = unsettledOrders.reduce((sum, o) => {
    const isSelfPickup = !!o.selfDelivery || o.deliveryType === 'Self Pickup';
    if (isSelfPickup) {
      return sum + (o.coinDiscount || 0);
    } else {
      return sum + (o.totalAmount || 0) + (o.coinDiscount || 0);
    }
  }, 0);

  const metrics = [
    { title: "Total Orders", value: loading ? "..." : (dashboard?.totalOrders ?? totalOrders).toString(), icon: ShoppingCart, color: "text-indigo-600", bg: "bg-indigo-100", link: "/shop/orders" },
    { 
      title: "New Orders", 
      value: loading ? "..." : newOrders.length.toString(), 
      icon: Clock, color: "text-amber-600", bg: "bg-amber-100", link: "/shop/orders?filter=pending",
      hasNotification: newOrders.length > 0 
    },
    { title: "Payment to Receive", value: loading ? "..." : `₹${paymentToReceive}`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", link: "#payment-history" },
    { title: "Total Products", value: loading ? "..." : products.length.toString(), icon: Package, color: "text-purple-600", bg: "bg-purple-100", link: "/shop/products" },
  ];

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
            <button 
              key={i} 
              onClick={() => {
                if (metric.link.startsWith('#')) {
                  document.querySelector(metric.link)?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  router.push(metric.link);
                }
              }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 relative"
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
          );
        })}
      </div>

      {/* Listed Products Overview */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Package size={20} className="text-indigo-600" /> Your Listed Products</h2>
          <button onClick={() => window.location.href = '/shop/products'} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">View All &rarr;</button>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="bg-gray-50/50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-6 font-medium">Product</th>
                <th className="p-6 font-medium">Category</th>
                <th className="p-6 font-medium">Price</th>
                <th className="p-6 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">Loading your products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500">You haven't listed any products yet.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id || product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img src={product.img?.url || product.product?.productImage?.[0]?.url || product.image || '/placeholder.png'} alt={product.name || product.product?.productName} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                        <div>
                          <p className="font-bold text-gray-900">{product.name || product.product?.productName}</p>
                          <p className="flex items-center text-xs text-gray-500 mt-1 gap-1"><MapPin size={12} /> {product.loc || 'In Stock'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600">
                        <Tag size={12} /> {product.itemCategory || product.product?.categories || product.category || 'General'}
                      </span>
                    </td>
                    <td className="p-6 font-bold text-gray-900">₹{product.price}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${product.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {product.isActive !== false ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div id="payment-history" className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600" /> Payment History (Pasr Settlements)
          </h2>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="bg-gray-50/50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-6 font-medium">Order ID / Date</th>
                <th className="p-6 font-medium">Actual Price</th>
                <th className="p-6 font-medium">Coin Discount</th>
                <th className="p-6 font-medium">Shop Collected</th>
                <th className="p-6 font-medium">Pasr Settlement</th>
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
                  const isSelfPickup = !!order.selfDelivery || order.deliveryType === 'Self Pickup';
                  const actualPrice = (order.totalAmount || 0) + (order.coinDiscount || 0);
                  const shopCollected = isSelfPickup ? (order.totalAmount || 0) : 0;
                  const pasrOwes = isSelfPickup ? (order.coinDiscount || 0) : actualPrice;
                  const orderTypeStr = isSelfPickup ? 'Self Pickup' : (order.paymentType === 'COD' ? 'COD Delivery' : 'Prepaid Delivery');

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                        <p className="font-bold text-gray-900">{order.orderId}</p>
                        <p className="text-xs text-gray-500 mt-1">{order.createdAt}</p>
                      </td>
                      <td className="p-6 font-bold text-gray-900">
                        ₹{actualPrice}
                      </td>
                      <td className="p-6 font-bold text-yellow-600">
                        {order.coinDiscount > 0 ? `-₹${order.coinDiscount}` : 'None'}
                      </td>
                      <td className="p-6 font-bold text-emerald-600">
                        ₹{shopCollected}
                      </td>
                      <td className="p-6 font-bold text-indigo-600">
                        ₹{pasrOwes}
                        <div className="text-[10px] text-gray-500 font-normal mt-1 flex items-center gap-1">
                           <CheckCircle2 size={10} className="text-emerald-500"/> Settled
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
