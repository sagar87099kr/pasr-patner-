'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt, User } from 'lucide-react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
}

export default function BillingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/shop/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (e) {
        console.error('Failed to fetch products', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [billGenerated]); // Re-fetch products when a bill is generated to update stock

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const name = p.name || p.product?.name || '';
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [products, search]);

  const addToCart = (product: any) => {
    if (product.quantity <= 0) return; // Out of stock
    
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev; // Cannot add more than stock
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        _id: product._id,
        name: product.name || product.product?.name || 'Unknown Item',
        price: product.price || 0,
        quantity: 1,
        stock: product.quantity,
        image: product.img?.url || product.product?.img?.url || product.product?.productImage?.[0]?.url || product.image || '/placeholder.png'
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) return item; // Can't exceed stock
        if (newQ <= 0) return item; // Use remove instead
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const generateBill = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/shop/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim() || 'Guest',
          items: cart.map(c => ({
            itemId: c._id,
            name: c.name,
            price: c.price,
            quantity: c.quantity
          })),
          totalAmount: subtotal
        })
      });
      const data = await res.json();
      if (res.ok) {
        setLastOrder(data.order);
        setBillGenerated(true);
        setCart([]);
        setCustomerName('');
      } else {
        alert('Failed to generate bill: ' + (data.message || data.error));
      }
    } catch (e: any) {
      alert('Error generating bill: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  const resetPOS = () => {
    setBillGenerated(false);
    setLastOrder(null);
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row h-auto lg:h-[calc(100vh-8rem)] gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Left Panel (Hidden on Mobile, Desktop Only): Product Selection */}
      <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex-col overflow-hidden h-[50vh] lg:h-auto">
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
          {loading ? (
            <div className="col-span-full flex justify-center py-10"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">No products found</div>
          ) : (
            filteredProducts.map(product => {
              const image = product.img?.url || product.product?.img?.url || product.product?.productImage?.[0]?.url || product.image;
              const name = product.name || product.product?.name || 'Unknown Item';
              const isOutOfStock = product.quantity <= 0;

              return (
                <div 
                  key={product._id} 
                  onClick={() => addToCart(product)}
                  className={`border border-gray-100 rounded-xl p-3 flex flex-col gap-2 transition-all select-none ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30'}`}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-1">
                    {image ? (
                      <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="text-gray-400 opacity-50" size={32} />
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">{name}</h4>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-indigo-600">₹{product.price || 0}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {isOutOfStock ? 'Out' : `Qty: ${product.quantity}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel (Top on Mobile): Cart & Billing */}
      <div className="w-full lg:w-[400px] bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0 min-h-[50vh] lg:min-h-0">
        <div className="p-4 bg-gray-900 text-white flex items-center gap-3">
          <Receipt size={24} className="text-indigo-400" />
          <h2 className="text-lg font-bold">Current Bill</h2>
        </div>

        {billGenerated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-emerald-50/30">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Receipt size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Bill Generated!</h3>
            <p className="text-gray-500 mb-6">Order ID: {lastOrder?.orderId}</p>
            <div className="bg-white border border-gray-100 rounded-xl p-4 w-full mb-8 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Customer</span>
                <span className="font-bold">{lastOrder?.customerName || 'Guest'}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">Items</span>
                <span className="font-bold">{lastOrder?.items?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-900 font-bold">Total Paid</span>
                <span className="font-bold text-emerald-600 text-lg">₹{lastOrder?.totalAmount || 0}</span>
              </div>
            </div>
            <button 
              onClick={resetPOS}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-200"
            >
              New Bill
            </button>
          </div>
        ) : (
          <>
            {/* Search Option - Now at the top of the Cart Panel */}
            <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products to add..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              {/* Mobile-only horizontal product recommendations */}
              <div className="lg:hidden flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar">
                {filteredProducts.length === 0 ? (
                  <span className="text-xs text-gray-500">No products match.</span>
                ) : (
                  filteredProducts.map(product => {
                    const image = product.img?.url || product.product?.img?.url || product.product?.productImage?.[0]?.url || product.image;
                    const name = product.name || product.product?.name || 'Unknown Item';
                    const isOutOfStock = product.quantity <= 0;

                    return (
                      <div 
                        key={product._id} 
                        onClick={() => addToCart(product)}
                        className={`shrink-0 w-24 border border-gray-100 rounded-xl p-2 flex flex-col items-center text-center transition-all select-none snap-start ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30'}`}
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center mb-1 shrink-0 shadow-sm">
                          {image ? (
                            <img src={image} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingCart className="text-gray-400 opacity-50" size={16} />
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 text-[10px] line-clamp-2 leading-tight w-full mb-1">{name}</h4>
                        <div className="mt-auto">
                          <span className="font-bold text-indigo-600 text-xs">₹{product.price || 0}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <ShoppingCart size={48} className="mb-4" />
                  <p>Cart is empty</p>
                  <p className="text-sm mt-1">Select products to add</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item._id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm text-gray-900 truncate">{item.name}</h5>
                      <p className="text-xs text-gray-500 font-medium">₹{item.price} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
                      <button onClick={() => updateQuantity(item._id, -1)} className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors text-gray-700"><Minus size={16} /></button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors text-gray-700"><Plus size={16} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Section: Customer Name & Subtotal */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all mb-4">
                <User size={18} className="text-gray-400 ml-2" />
                <input 
                  type="text" 
                  placeholder="Customer Name (Optional)" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="bg-transparent border-none focus:outline-none w-full text-base font-bold text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold text-xl text-gray-900">₹{subtotal}</span>
              </div>
              
              <button 
                onClick={generateBill}
                disabled={cart.length === 0 || processing}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                {processing ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</>
                ) : (
                  <>Complete Bill <span className="opacity-70 font-normal">|</span> ₹{subtotal}</>
                )}
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
