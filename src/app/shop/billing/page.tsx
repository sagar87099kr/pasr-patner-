'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Search, Plus, Minus, Trash2, ShoppingCart, Receipt, User, Phone, MapPin, 
  Truck, Store, CheckCircle2, AlertCircle, Share2, Printer, ArrowRight, Sparkles,
  ScanLine, Volume2, VolumeX, Check, Link2, X, Tag, Box, PackagePlus
} from 'lucide-react';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
  barcode?: string;
}

export default function BillingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Barcode & Audio Feedback State
  const [showScanner, setShowScanner] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanToast, setScanToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Quick Link Unlinked Barcode Modal State
  const [unlinkedBarcode, setUnlinkedBarcode] = useState<string | null>(null);
  const [linkingProductId, setLinkingProductId] = useState<string>('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');
  const [activeLinkTab, setActiveLinkTab] = useState<'existing' | 'new'>('existing');
  const [quickNewName, setQuickNewName] = useState('');
  const [quickNewPrice, setQuickNewPrice] = useState('');
  const [quickNewStock, setQuickNewStock] = useState('10');
  const [quickNewCategory, setQuickNewCategory] = useState('General');

  // Customer Info State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCoordinates, setCustomerCoordinates] = useState<number[] | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [isFirstOrder, setIsFirstOrder] = useState<boolean>(false);
  const [customerCoins, setCustomerCoins] = useState<number>(0);
  const [lookingUpCustomer, setLookingUpCustomer] = useState(false);

  // Delivery Mode State
  const [deliveryType, setDeliveryType] = useState<'SHOP_PICKUP' | 'HOME_DELIVERY'>('SHOP_PICKUP');
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    hubName: string;
    distanceKm: number;
    deliveryCharge: number;
    standardCharge: number;
    freeDeliveryThreshold: number | null;
    isFreeDelivery: boolean;
  } | null>(null);

  // Processing & Bill Generation State
  const [processing, setProcessing] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);
  const [lastOrderData, setLastOrderData] = useState<any>(null);

  // Synthesize pleasant POS cashier beep sounds
  const playBeep = useCallback((type: 'success' | 'error' = 'success') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, ctx.currentTime); // High positive checkout chime
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // Low buzz tone
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // AudioContext blocked or not supported
    }
  }, [soundEnabled]);

  // Fetch Products with live cache-busting
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/shop/products?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list = data.products || [];
        setProducts(list);
        return list;
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, billGenerated]);

  // Add Item to Cart
  const addToCart = useCallback((product: any) => {
    if (product.quantity <= 0) {
      playBeep('error');
      setScanToast({ message: `"${product.name || 'Item'}" is Out of Stock!`, type: 'error' });
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          setScanToast({ message: `Maximum stock (${product.quantity}) reached for "${existing.name}"`, type: 'warning' });
          return prev;
        }
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        _id: product._id,
        name: product.name || product.product?.name || 'Unknown Item',
        price: product.price || 0,
        quantity: 1,
        stock: product.quantity,
        barcode: product.barcode || product.product?.barcode || '',
        image: product.img?.url || product.product?.img?.url || product.product?.productImage?.[0]?.url || product.image || '/placeholder.png'
      }];
    });
  }, [playBeep]);

  // Link an unlinked barcode to an existing inventory product
  const handleLinkBarcodeToProduct = async (productToLink: any) => {
    if (!unlinkedBarcode || !productToLink) return;
    setIsLinking(true);
    try {
      const res = await fetch(`/api/shop/products/${productToLink._id || productToLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode: unlinkedBarcode,
          name: productToLink.name || productToLink.product?.name,
          category: productToLink.itemCategory || productToLink.category || productToLink.product?.category,
          price: productToLink.price,
          stock: productToLink.quantity || productToLink.qty
        })
      });

      if (res.ok) {
        const updated = { ...productToLink, barcode: unlinkedBarcode };
        setProducts(prev => prev.map(p => (p._id === updated._id ? updated : p)));
        addToCart(updated);
        playBeep('success');
        setScanToast({ message: `Linked & Added "${updated.name || 'Product'}" to bill!`, type: 'success' });
        setUnlinkedBarcode(null);
        setLinkingProductId('');
      } else {
        const data = await res.json();
        alert(data.message || data.error || 'Failed to link barcode');
      }
    } catch (err: any) {
      alert('Error linking barcode: ' + err.message);
    } finally {
      setIsLinking(false);
    }
  };

  // Quick create a new product with the scanned barcode and add to bill
  const handleQuickCreateProductWithBarcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlinkedBarcode || !quickNewName.trim() || !quickNewPrice) {
      alert('Please provide product name and price');
      return;
    }
    setIsLinking(true);
    try {
      const payload = {
        name: quickNewName.trim(),
        price: Number(quickNewPrice),
        stock: Number(quickNewStock) || 1,
        category: quickNewCategory || 'General',
        barcode: unlinkedBarcode
      };
      const res = await fetch('/api/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.product) {
        const newProd = {
          ...data.product,
          name: quickNewName.trim(),
          price: Number(quickNewPrice),
          quantity: Number(quickNewStock) || 1,
          barcode: unlinkedBarcode
        };
        setProducts(prev => [newProd, ...prev]);
        addToCart(newProd);
        playBeep('success');
        setScanToast({ message: `Created & added "${quickNewName}" to bill!`, type: 'success' });
        setUnlinkedBarcode(null);
        setQuickNewName('');
        setQuickNewPrice('');
      } else {
        alert(data.message || data.error || 'Failed to create product');
      }
    } catch (err: any) {
      alert('Error creating product: ' + err.message);
    } finally {
      setIsLinking(false);
    }
  };

  // Fast Barcode Lookup & Add to Cart (with live inventory fallback & quick-link prompt)
  const handleBarcodeScan = useCallback(async (scannedCode: string) => {
    const raw = scannedCode.trim();
    if (!raw) return;

    const clean = (str: any) => {
      let s = String(str || '').trim();
      s = s.replace(/^\][a-z0-9]{2}/i, ''); // Strip AIM symbology identifiers
      return s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    };
    const cleanCode = clean(raw);
    const normalizedCode = cleanCode.replace(/^0+/, '');

    const findMatch = (items: any[]) => {
      return items.find(p => {
        const b1 = clean(p.barcode);
        const b2 = clean(p.product?.barcode);
        const b3 = clean(p.itemBarcode);
        const b4 = clean(p.sku);
        if (b1 && (b1 === cleanCode || b1.replace(/^0+/, '') === normalizedCode)) return true;
        if (b2 && (b2 === cleanCode || b2.replace(/^0+/, '') === normalizedCode)) return true;
        if (b3 && (b3 === cleanCode || b3.replace(/^0+/, '') === normalizedCode)) return true;
        if (b4 && (b4 === cleanCode || b4.replace(/^0+/, '') === normalizedCode)) return true;
        if (String(p._id) === raw || String(p.id) === raw) return true;
        if (String(p.product?._id) === raw) return true;
        const pName = clean(p.name || p.product?.name);
        if (pName && pName === cleanCode) return true;
        return false;
      });
    };

    let matched = findMatch(products);

    // If not found in current state, perform a live real-time fetch to ensure freshest inventory
    if (!matched) {
      try {
        const freshList = await fetchProducts();
        if (freshList && freshList.length > 0) {
          matched = findMatch(freshList);
        }
      } catch (err) {
        console.warn('Live inventory re-fetch failed', err);
      }
    }

    if (matched) {
      if (matched.quantity <= 0) {
        playBeep('error');
        setScanToast({ message: `"${matched.name || 'Item'}" is Out of Stock!`, type: 'error' });
        return;
      }
      addToCart(matched);
      playBeep('success');
      setShowScanner(false); // Auto-close camera scanner after product is added
      const name = matched.name || matched.product?.name || 'Item';
      setScanToast({ message: `Added +1 ${name} (₹${matched.price || 0})`, type: 'success' });
    } else {
      playBeep('error');
      setShowScanner(false); // Close camera modal to show the quick link dialog
      setUnlinkedBarcode(raw);
      setLinkSearch('');
      setLinkingProductId('');
      setActiveLinkTab('existing');
      setScanToast({ message: `Barcode "${raw}" is not linked to any product yet.`, type: 'warning' });
    }
  }, [products, addToCart, playBeep, fetchProducts]);

  // Hardware Barcode Scanner Listener (USB / Bluetooth Laser Scanners)
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) {
          e.preventDefault();
          handleBarcodeScan(barcodeBuffer);
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // High typing speed (< 60ms between keystrokes) indicates a laser scanner gun
        if (timeDiff > 70 && isInput) {
          barcodeBuffer = e.key;
        } else {
          barcodeBuffer += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBarcodeScan]);

  // Auto-dismiss scan toast
  useEffect(() => {
    if (scanToast) {
      const timer = setTimeout(() => setScanToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [scanToast]);

  // Customer Phone Lookup with Debounce
  useEffect(() => {
    const cleanNumber = customerPhone.replace(/\D/g, '');
    if (cleanNumber.length === 10) {
      const lookupCustomer = async () => {
        setLookingUpCustomer(true);
        try {
          const res = await fetch(`/api/shop/customers/lookup?phone=${cleanNumber}`);
          const data = await res.json();
          if (res.ok && data.success && data.registered && data.customer) {
            setCustomerName(data.customer.name || '');
            setCustomerAddress(data.customer.address || '');
            setCustomerCoordinates(data.customer.geometry?.coordinates || null);
            setIsRegistered(true);
            setIsFirstOrder(data.customer.isFirstOrder || false);
            setCustomerCoins(data.customer.coins || 0);
          } else {
            setIsRegistered(false);
            setIsFirstOrder(false);
          }
        } catch (err) {
          console.error('Customer lookup error', err);
          setIsRegistered(false);
        } finally {
          setLookingUpCustomer(false);
        }
      };
      lookupCustomer();
    } else {
      setIsRegistered(null);
      setIsFirstOrder(false);
    }
  }, [customerPhone]);

  // Subtotal Calculation
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  // Calculate Delivery when Home Delivery is selected or subtotal/coords change
  const updateDeliveryPricing = useCallback(async () => {
    if (deliveryType !== 'HOME_DELIVERY') {
      setDeliveryInfo(null);
      return;
    }

    setCalculatingDelivery(true);
    try {
      const res = await fetch('/api/shop/calculate-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerCoordinates,
          customerAddress,
          subtotal,
          isFirstOrder
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDeliveryInfo({
          hubName: data.hubName || 'Bazaar Hub',
          distanceKm: data.distanceKm || 1.0,
          deliveryCharge: data.deliveryCharge || 0,
          standardCharge: data.standardCharge || 5,
          freeDeliveryThreshold: (data.freeDeliveryThreshold !== undefined) ? data.freeDeliveryThreshold : null,
          isFreeDelivery: data.isFreeDelivery || false
        });
      }
    } catch (err) {
      console.error('Delivery calculation error', err);
    } finally {
      setCalculatingDelivery(false);
    }
  }, [deliveryType, customerCoordinates, customerAddress, subtotal, isFirstOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateDeliveryPricing();
    }, 350);
    return () => clearTimeout(timer);
  }, [updateDeliveryPricing]);

  // Total Calculation
  const effectiveDeliveryFee = deliveryType === 'HOME_DELIVERY' ? (deliveryInfo?.deliveryCharge || 0) : 0;
  const grandTotal = subtotal + effectiveDeliveryFee;

  // Filter products by search, or show Top 20 fast-selling items
  const displayedProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) {
      return products.filter(p => {
        const name = (p.name || p.product?.name || '').toLowerCase();
        const barcode = String(p.barcode || p.product?.barcode || '').toLowerCase();
        const cat = (p.itemCategory || p.product?.category || '').toLowerCase();
        return name.includes(q) || barcode.includes(q) || cat.includes(q);
      });
    }
    // Default: Show top 20 items (in-stock first)
    return [...products]
      .sort((a, b) => (b.quantity > 0 ? 1 : 0) - (a.quantity > 0 ? 1 : 0))
      .slice(0, 20);
  }, [products, search]);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) {
          setScanToast({ message: `Max stock (${item.stock}) reached for "${item.name}"`, type: 'warning' });
          return item;
        }
        if (newQ <= 0) return item;
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const generateBill = async () => {
    if (cart.length === 0) return;
    if (deliveryType === 'HOME_DELIVERY' && !customerAddress.trim()) {
      alert('Please provide customer delivery address for Home Delivery.');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/shop/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim() || 'Customer',
          customerPhone: customerPhone.trim() || undefined,
          customerAddress: customerAddress.trim() || undefined,
          deliveryType,
          deliveryCharge: effectiveDeliveryFee,
          distanceKm: deliveryInfo?.distanceKm || 0,
          items: cart.map(c => ({
            itemId: c._id,
            name: c.name,
            price: c.price,
            quantity: c.quantity
          })),
          totalAmount: grandTotal
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastOrderData({
          order: data.order,
          shopName: data.shopName || 'PASR Partner Shop',
          shopLocation: data.shopLocation || 'Bazaar'
        });
        setBillGenerated(true);
        setCart([]);
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
    setLastOrderData(null);
    setCustomerPhone('');
    setCustomerName('');
    setCustomerAddress('');
    setCustomerCoordinates(null);
    setIsRegistered(null);
    setDeliveryType('SHOP_PICKUP');
  };

  // Generate WhatsApp Message Link
  const getWhatsAppShareUrl = () => {
    if (!lastOrderData || !lastOrderData.order) return '#';
    const order = lastOrderData.order;
    const phone = customerPhone.replace(/\D/g, '').slice(-10);

    const itemsText = (order.items || []).map((it: any, idx: number) => {
      return `${idx + 1}. *${it.name}* (x${it.quantity}) - ₹${it.price * it.quantity}`;
    }).join('\n');

    const message = `🧾 *PASR DIGITAL INVOICE*\n` +
      `🏪 *${lastOrderData.shopName || 'PASR Partner'}*\n` +
      `📍 ${lastOrderData.shopLocation || 'Local Bazaar'}\n\n` +
      `📋 *Order ID:* ${order.orderId}\n` +
      `👤 *Customer:* ${order.customerName || 'Customer'} ${phone ? `(${phone})` : ''}\n` +
      `📅 *Date:* ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}\n` +
      (order.deliveryType === 'HOME_DELIVERY' ? `🛵 *Type:* HOME DELIVERY\n📍 *Address:* ${order.deliveryAddress || customerAddress}\n` : `🏬 *Type:* IN-STORE PICKUP\n`) +
      `\n----------------------------------\n` +
      `*ITEMS PURCHASED:*\n${itemsText}\n` +
      `----------------------------------\n` +
      `📦 *Subtotal:* ₹${order.subtotalAmount || order.totalAmount}\n` +
      (order.deliveryType === 'HOME_DELIVERY' ? `🛵 *Delivery Charge:* ${order.deliveryCharge === 0 ? '₹0 (FREE DELIVERY)' : `₹${order.deliveryCharge}`}\n` : '') +
      `💰 *TOTAL PAID / PAYABLE:* ₹${order.totalAmount}\n` +
      `💳 *Payment:* ${order.paymentType || 'COD'} (${order.paymentStatus || 'COMPLETED'})\n\n` +
      `✨ *Thank you for shopping locally!* \n` +
      `🌐 Powered by PASR Platform (https://pasr.in)`;

    const targetNumber = phone.length === 10 ? `91${phone}` : '';
    return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row h-auto lg:h-[calc(100vh-7rem)] gap-4 lg:gap-6 animate-in fade-in duration-300">
      
      {/* ── LEFT PANEL: Product Catalog (Desktop & Tablet) ── */}
      <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex-col overflow-hidden h-auto">
        
        {/* Catalog Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">
                  {search.trim() ? 'Search Results' : 'Top 20 Fast-Selling Products'}
                </h3>
                <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  {displayedProducts.length} items
                </span>
              </div>
              {!search.trim() && (
                <p className="text-[10px] text-gray-400 font-medium">Search by name or scan barcode to add directly</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                  : 'bg-gray-100 border-gray-200 text-gray-400 hover:text-gray-600'
              }`}
              title={soundEnabled ? 'POS Audio Beep Enabled (Click to mute)' : 'POS Audio Beep Muted (Click to unmute)'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-100 shrink-0"
              title="Open Barcode Scanner Camera (Continuous Scan)"
            >
              <ScanLine size={15} />
              <span>Scan Barcode</span>
            </button>

            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input 
                type="text" 
                placeholder="Search name or barcode..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-gray-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search.trim()) {
                    handleBarcodeScan(search.trim());
                    setSearch('');
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <ShoppingCart className="mx-auto w-10 h-10 text-gray-300 mb-2" />
              <p className="font-semibold text-sm">No products found</p>
            </div>
          ) : (
            displayedProducts.map(product => {
              const image = product.img?.url || product.product?.img?.url || product.product?.productImage?.[0]?.url || product.image;
              const name = product.name || product.product?.name || 'Unknown Item';
              const isOutOfStock = product.quantity <= 0;

              return (
                <div 
                  key={product._id} 
                  onClick={() => addToCart(product)}
                  className={`border border-gray-100 rounded-xl p-3 flex flex-col gap-2 transition-all select-none ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/20 active:scale-[0.98]'}`}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-1">
                    {image ? (
                      <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="text-gray-400 opacity-50" size={32} />
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 text-xs line-clamp-2 leading-tight">{name}</h4>
                  <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-50">
                    <span className="font-extrabold text-indigo-600 text-sm">₹{product.price || 0}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      {isOutOfStock ? 'Out' : `Stock: ${product.quantity}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Billing POS, Customer Lookup & Checkout ── */}
      <div className="w-full lg:w-[460px] bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden shrink-0 min-h-[60vh] lg:min-h-0">
        
        {/* Panel Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt size={22} className="text-indigo-400" />
            <h2 className="text-base font-extrabold tracking-tight">Smart POS Billing</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="lg:hidden p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
              title="Scan Barcode"
            >
              <ScanLine size={14} />
              <span>Scan</span>
            </button>
            <span className="text-xs bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-full font-semibold border border-slate-700">
              {cart.length} Items
            </span>
          </div>
        </div>

        {billGenerated ? (
          /* ── SUCCESS RECEIPT SCREEN ── */
          <div className="flex-1 flex flex-col p-6 overflow-y-auto text-center bg-slate-50/50">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              {lastOrderData?.order?.deliveryType === 'HOME_DELIVERY' ? 'Home Delivery Dispatched!' : 'Bill Completed!'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">Invoice #{lastOrderData?.order?.orderId}</p>

            {/* Receipt Summary Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5 text-left shadow-sm text-xs space-y-2">
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500">Customer</span>
                <span className="font-bold text-gray-900">{lastOrderData?.order?.customerName || 'Customer'}</span>
              </div>
              {customerPhone && (
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Mobile</span>
                  <span className="font-bold text-gray-900">{customerPhone}</span>
                </div>
              )}
              {lastOrderData?.order?.deliveryType === 'HOME_DELIVERY' && (
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Delivery Address</span>
                  <span className="font-bold text-gray-900 text-right max-w-[200px] truncate">{lastOrderData?.order?.deliveryAddress || customerAddress}</span>
                </div>
              )}
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500">Total Items</span>
                <span className="font-bold text-gray-900">{lastOrderData?.order?.items?.length || 0}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-emerald-600 font-extrabold text-base">₹{lastOrderData?.order?.totalAmount}</span>
              </div>
            </div>

            {/* Actions: Send on WhatsApp & Print */}
            <div className="flex flex-col gap-2.5">
              <a 
                href={getWhatsAppShareUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2 text-sm"
              >
                <Share2 size={18} />
                <span>Send Receipt on WhatsApp</span>
              </a>

              <button 
                onClick={() => window.print()}
                className="w-full py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-200 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>

              <button 
                onClick={resetPOS}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md mt-2 text-sm"
              >
                Start New Bill
              </button>
            </div>
          </div>
        ) : (
          /* ── POS CART & DETAILS FORM ── */
          <>
            {/* 1. Customer Phone Lookup & Auto-fill Section */}
            <div className="p-3.5 bg-slate-50 border-b border-gray-100 flex flex-col gap-2.5">
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input 
                    type="tel" 
                    maxLength={10}
                    placeholder="Enter Customer Mobile (e.g. 9876543210)" 
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-gray-900"
                  />
                  {lookingUpCustomer && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>

              {/* Customer Verification Status Badge */}
              {isRegistered === true && (
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Verified PASR Customer
                  </span>
                  {customerCoins > 0 && (
                    <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                      🪙 {customerCoins} Coins
                    </span>
                  )}
                </div>
              )}

              {isRegistered === false && customerPhone.length === 10 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-medium">
                  <AlertCircle size={14} className="text-amber-600" />
                  New / Walk-in Customer (Manual details enabled)
                </div>
              )}

              {/* Name & Address Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Customer Name *" 
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Address / Area" 
                    value={customerAddress}
                    onChange={e => {
                      setCustomerAddress(e.target.value);
                      setCustomerCoordinates(null);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 2. Order Type Toggle (Counter Pickup vs Home Delivery) */}
              <div className="pt-1">
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/70 rounded-xl">
                  <button 
                    type="button"
                    onClick={() => setDeliveryType('SHOP_PICKUP')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${deliveryType === 'SHOP_PICKUP' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Store size={14} />
                    <span>Counter / Pickup</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setDeliveryType('HOME_DELIVERY')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${deliveryType === 'HOME_DELIVERY' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Truck size={14} />
                    <span>Home Delivery</span>
                  </button>
                </div>

                {/* Delivery Calculation from Bazaar Hub Display */}
                {deliveryType === 'HOME_DELIVERY' && (
                  <div className="mt-2 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs flex flex-col gap-1 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium flex items-center gap-1">
                        <Truck size={13} className="text-indigo-600" />
                        Distance from <strong>{deliveryInfo?.hubName || 'Bazaar Hub'}</strong>:
                      </span>
                      <span className="font-bold text-gray-900">
                        {calculatingDelivery ? 'Calculating...' : `${deliveryInfo?.distanceKm || 1.0} km`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-indigo-100/60">
                      <span className="text-gray-600">Delivery Charge:</span>
                      {deliveryInfo?.isFreeDelivery ? (
                        <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                          <Sparkles size={12} className="text-amber-500" /> ₹0 (FREE DELIVERY)
                        </span>
                      ) : (
                        <span className="font-extrabold text-indigo-700">₹{deliveryInfo?.deliveryCharge || 0}</span>
                      )}
                    </div>

                    {/* Dynamic Distance-Based Free Delivery Upsell Prompt */}
                    {!deliveryInfo?.isFreeDelivery && deliveryInfo?.freeDeliveryThreshold && (
                      <div className="mt-1 p-1.5 bg-amber-50/90 border border-amber-200 rounded-lg flex items-center justify-between text-[10.5px] text-amber-900 font-semibold animate-in fade-in">
                        <span>💡 Add <strong className="text-amber-700 font-bold">₹{Math.max(0, deliveryInfo.freeDeliveryThreshold - subtotal)}</strong> more for FREE Delivery!</span>
                        <span className="text-[9.5px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Free above ₹{deliveryInfo.freeDeliveryThreshold}</span>
                      </div>
                    )}

                    {/* Free Delivery Success Badge */}
                    {deliveryInfo?.isFreeDelivery && (
                      <div className="mt-1 p-1 bg-emerald-100/80 border border-emerald-200 rounded-lg flex items-center gap-1.5 text-[10.5px] text-emerald-800 font-bold animate-in fade-in">
                        <Sparkles size={13} className="text-emerald-600" />
                        <span>🎉 FREE Delivery Unlocked for this location!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* 3. Mobile Product Recommendation / Search Bar */}
            <div className="lg:hidden p-3 border-b border-gray-100 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input 
                    type="text" 
                    placeholder="Search name or barcode..." 
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && search.trim()) {
                        handleBarcodeScan(search.trim());
                        setSearch('');
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg flex items-center justify-center hover:bg-indigo-100"
                  title="Scan Barcode"
                >
                  <ScanLine size={16} />
                </button>
              </div>

              <div className="flex overflow-x-auto gap-2 pb-1 snap-x hide-scrollbar">
                {displayedProducts.slice(0, 15).map(product => {
                  const image = product.img?.url || product.product?.img?.url || product.image;
                  const name = product.name || product.product?.name || 'Item';
                  const isOutOfStock = product.quantity <= 0;

                  return (
                    <div 
                      key={product._id} 
                      onClick={() => addToCart(product)}
                      className={`shrink-0 w-24 border border-gray-100 rounded-lg p-1.5 flex flex-col items-center text-center select-none snap-start ${isOutOfStock ? 'opacity-50' : 'cursor-pointer hover:border-indigo-300 bg-white'}`}
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex items-center justify-center mb-1">
                        {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <ShoppingCart size={14} className="text-gray-400" />}
                      </div>
                      <h5 className="font-bold text-[10px] text-gray-900 line-clamp-1 w-full">{name}</h5>
                      <span className="text-[11px] font-extrabold text-indigo-600">₹{product.price || 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2 bg-slate-50/40">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8 opacity-70">
                  <ShoppingCart size={36} className="mb-2 text-gray-300" />
                  <p className="font-bold text-xs text-gray-600">No items added to bill</p>
                  <p className="text-[11px] text-gray-400">Scan barcodes or click items from the catalog</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item._id} className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-xs text-gray-900 truncate">{item.name}</h5>
                        {item.barcode && (
                          <span className="text-[9px] font-mono bg-gray-100 text-gray-500 px-1 py-0.2 rounded shrink-0">
                            {item.barcode.slice(-5)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">₹{item.price} x {item.quantity} = <strong className="text-gray-900">₹{item.price * item.quantity}</strong></p>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
                      <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-gray-200 rounded-l-lg text-gray-700"><Minus size={14} /></button>
                      <span className="w-6 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-gray-200 rounded-r-lg text-gray-700"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* 5. Subtotal, Delivery & Complete Bill Button */}
            <div className="p-4 bg-white border-t border-gray-100 shadow-lg">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>

              {deliveryType === 'HOME_DELIVERY' && (
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <span>Delivery Fee ({deliveryInfo?.hubName || 'Bazaar'})</span>
                  <span className={`font-bold ${deliveryInfo?.isFreeDelivery ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {deliveryInfo?.isFreeDelivery ? '₹0 (FREE)' : `₹${effectiveDeliveryFee}`}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center mb-3 pt-2 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-900">Total Payable</span>
                <span className="font-extrabold text-xl text-indigo-700">₹{grandTotal}</span>
              </div>
              
              <button 
                onClick={generateBill}
                disabled={cart.length === 0 || processing}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 text-sm"
              >
                {processing ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating Bill...</>
                ) : (
                  <>
                    <span>{deliveryType === 'HOME_DELIVERY' ? 'Dispatch Home Delivery' : 'Complete Counter Bill'}</span>
                    <span className="opacity-60 font-normal">|</span>
                    <span>₹{grandTotal}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </>
        )}

      </div>

      {/* Floating Scan Feedback Toast */}
      {scanToast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] px-4 py-2.5 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-200 ${
          scanToast.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/50 backdrop-blur-md'
            : scanToast.type === 'error'
              ? 'bg-red-950/90 text-red-100 border-red-500/50 backdrop-blur-md'
              : 'bg-amber-950/90 text-amber-100 border-amber-500/50 backdrop-blur-md'
        }`}>
          {scanToast.type === 'success' && <Check size={16} className="text-emerald-400" />}
          {scanToast.type === 'error' && <AlertCircle size={16} className="text-red-400" />}
          {scanToast.type === 'warning' && <AlertCircle size={16} className="text-amber-400" />}
          <span>{scanToast.message}</span>
        </div>
      )}

      {/* Live Barcode Scanner Modal with Continuous Scan Mode */}
      {showScanner && (
        <BarcodeScannerModal 
          continuous={true}
          title="POS Barcode Scanner"
          subtitle="Point camera at product barcodes to quickly add items to the bill"
          onClose={() => setShowScanner(false)} 
          onScanSuccess={handleBarcodeScan} 
        />
      )}

      {/* Quick Link Unrecognized Barcode Modal */}
      {unlinkedBarcode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4" onClick={() => setUnlinkedBarcode(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
                  <ScanLine size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Unlinked Barcode</h3>
                  <p className="text-xs text-gray-500 font-mono flex items-center gap-1.5 mt-0.5">
                    Code: <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded-md border border-gray-200">{unlinkedBarcode}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setUnlinkedBarcode(null)} className="p-2 hover:bg-white/80 rounded-full transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveLinkTab('existing')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeLinkTab === 'existing' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Link2 size={14} /> Link to Existing Item
              </button>
              <button
                type="button"
                onClick={() => setActiveLinkTab('new')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeLinkTab === 'new' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <PackagePlus size={14} /> Create New Product
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {activeLinkTab === 'existing' ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search item to link..."
                      value={linkSearch}
                      onChange={e => setLinkSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      autoFocus
                    />
                  </div>

                  <p className="text-[11px] text-gray-400 font-medium">Select a product below to link this barcode permanently and add to bill:</p>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {products
                      .filter(p => {
                        const name = (p.name || p.product?.name || '').toLowerCase();
                        const cat = (p.itemCategory || p.product?.category || '').toLowerCase();
                        const q = linkSearch.trim().toLowerCase();
                        return !q || name.includes(q) || cat.includes(q);
                      })
                      .map(p => {
                        const name = p.name || p.product?.name || 'Unknown Item';
                        const image = p.img?.url || p.product?.img?.url || p.product?.productImage?.[0]?.url || p.image;
                        return (
                          <div
                            key={p._id}
                            onClick={() => handleLinkBarcodeToProduct(p)}
                            className="p-3 bg-white border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {image ? (
                                  <img src={image} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                  <Box className="text-gray-400" size={18} />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-xs group-hover:text-indigo-600 transition-colors">{name}</p>
                                <p className="text-[11px] text-gray-500 font-medium">₹{p.price || 0} • Stock: {p.quantity || p.qty || 0}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={isLinking}
                              className="px-3 py-1.5 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white rounded-xl text-xs font-bold transition-all shrink-0"
                            >
                              {isLinking ? 'Linking...' : 'Link & Add'}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuickCreateProductWithBarcode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pears Pure Soap 75g"
                      value={quickNewName}
                      onChange={e => setQuickNewName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="e.g. 45"
                        value={quickNewPrice}
                        onChange={e => setQuickNewPrice(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Stock Quantity</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="10"
                        value={quickNewStock}
                        onChange={e => setQuickNewStock(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="General Store"
                      value={quickNewCategory}
                      onChange={e => setQuickNewCategory(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLinking || !quickNewName.trim() || !quickNewPrice}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                  >
                    {isLinking ? 'Creating & Linking...' : 'Create & Add to Bill'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
