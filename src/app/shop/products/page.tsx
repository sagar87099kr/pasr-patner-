'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, Box, MapPin, X, Sparkles, ScanLine, Image as ImageIcon, AlertTriangle, ArrowRight } from 'lucide-react';
import { SHOP_CATEGORIES } from '@/lib/categories';
import { compressImage } from '@/lib/imageCompression';
import AiCatalogModal from '@/components/AiCatalogModal';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import SharedImageLibraryModal from '@/components/SharedImageLibraryModal';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopCategory, setShopCategory] = useState<string>('General Store');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiCredits, setAiCredits] = useState(0);
  const [addingProduct, setAddingProduct] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [alreadyRegisteredProduct, setAlreadyRegisteredProduct] = useState<{ product: any; barcode: string } | null>(null);
  const [autofillSource, setAutofillSource] = useState<'community' | 'catalog' | ''>('');
  const [newProduct, setNewProduct] = useState({ 
    name: '', category: '', price: '', stock: '1', description: '', offer: '0', image: '', images: [] as string[], productId: '', barcode: '',
    deliveryType: 'standard', canDeliverByBike: true, preparationTime: '0', maxDeliveryDistance: '10', availableForDelivery: true
  });
  
  const [showScanner, setShowScanner] = useState(false);
  const [isScanningLookup, setIsScanningLookup] = useState(false);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [imageLibraryTarget, setImageLibraryTarget] = useState<'add' | 'edit'>('add');
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  // Normalize barcode string for robust matching across AIM identifiers, padding zeroes, etc.
  const cleanBarcodeString = (str: any) => {
    let s = String(str || '').trim();
    s = s.replace(/^\][a-z0-9]{2}/i, ''); // Strip standard AIM symbology identifiers
    return s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  };

  // Find if an existing product in this shop's inventory matches the barcode
  const findExistingProductByBarcode = (scannedCode: string) => {
    const raw = String(scannedCode || '').trim();
    if (!raw) return null;
    const cleanCode = cleanBarcodeString(raw);
    const normalized = cleanCode.replace(/^0+/, '');

    return products.find((p: any) => {
      const b1 = cleanBarcodeString(p.barcode);
      const b2 = cleanBarcodeString(p.product?.barcode);
      const b3 = cleanBarcodeString(p.itemBarcode);
      if (b1 && b1 === cleanCode) return true;
      if (b2 && b2 === cleanCode) return true;
      if (b3 && b3 === cleanCode) return true;
      if (normalized) {
        if (b1 && b1.replace(/^0+/, '') === normalized) return true;
        if (b2 && b2.replace(/^0+/, '') === normalized) return true;
        if (b3 && b3.replace(/^0+/, '') === normalized) return true;
      }
      return false;
    });
  };

  // Open the edit modal with complete product data prefilled
  const openEditModalForProduct = (product: any) => {
    setEditingProduct({
      ...product,
      _id: product._id || product.id,
      id: product._id || product.id,
      name: product.name || product.product?.name || '',
      category: product.itemCategory || product.category || product.product?.category || '',
      description: product.description || product.product?.description || '',
      discount: product.discount || product.discountPercent || 0,
      barcode: product.barcode || product.product?.barcode || '',
      price: product.price,
      quantity: product.quantity || product.qty || 1,
      qty: product.quantity || product.qty || 1,
      image: product.img?.url || product.product?.img?.url || product.image || '',
      images: product.extraImages ? [product.img?.url, ...product.extraImages.map((e: any) => e.url)].filter(Boolean) : (product.img?.url ? [product.img.url] : (product.image ? [product.image] : []))
    });
    setShowEditModal(true);
  };

  useEffect(() => {
    const fetchShopProfile = async () => {
      try {
        const res = await fetch('/api/shop/profile', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.category) {
            setShopCategory(data.profile.category);
          } else if (data.profile?.type) {
            setShopCategory(data.profile.type);
          }
        }
      } catch (e) {
        console.error('Failed to fetch shop profile', e);
      }
    };
    fetchShopProfile();

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/shop/products', { cache: 'no-store' });
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
  }, []);

  const openAiStudio = async () => {
    try {
      const res = await fetch('/api/ai/credits');
      if (res.ok) {
        const data = await res.json();
        setAiCredits(data.credits || 0);
      }
    } catch (e) {
      console.error(e);
    }
    setShowAiModal(true);
  };

  const handleBarcodeScanned = async (barcode: string) => {
    setShowScanner(false);
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;

    // If scanning while editing an existing product
    if (editingProduct && showEditModal) {
      const conflictingOther = findExistingProductByBarcode(cleanBarcode);
      if (conflictingOther && (conflictingOther._id || conflictingOther.id) !== (editingProduct._id || editingProduct.id)) {
        alert(`Barcode "${cleanBarcode}" is already assigned to "${conflictingOther.name || conflictingOther.product?.name || 'another product'}". Please use a unique barcode.`);
        return;
      }
      setEditingProduct((prev: any) => ({ ...prev, barcode: cleanBarcode }));
      return;
    }

    // 1. Instant check: Has this shop already registered this product?
    const existing = findExistingProductByBarcode(cleanBarcode);
    if (existing) {
      setShowAddModal(false);
      setAlreadyRegisteredProduct({
        product: existing,
        barcode: cleanBarcode
      });
      return;
    }

    setIsScanningLookup(true);
    try {
      const res = await fetch(`/api/shop/products/barcode?barcode=${encodeURIComponent(cleanBarcode)}`);
      if (res.ok) {
        const data = await res.json();

        // If the lookup detected this product is already in the shop's catalogue
        if (data.alreadyRegistered && (data.existingProduct || data.product)) {
          setShowAddModal(false);
          setAlreadyRegisteredProduct({
            product: data.existingProduct || data.product,
            barcode: cleanBarcode
          });
          return;
        }

        if (data.found && data.product) {
          const product = data.product;
          
          const availableCategories = SHOP_CATEGORIES[shopCategory as keyof typeof SHOP_CATEGORIES] || SHOP_CATEGORIES['General Store'] || [];
          let matchedCategory = '';
          if (product.category) {
            const lowerCat = product.category.toLowerCase();
            const matched = availableCategories.find(c => lowerCat.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(lowerCat));
            if (matched) {
              matchedCategory = matched.name;
            }
          }
          
          const imgUrl = product.image || '';
          const imgList = product.images && product.images.length > 0 ? product.images : (imgUrl ? [imgUrl] : []);

          setNewProduct(prev => ({
            ...prev,
            barcode: cleanBarcode,
            name: product.name || prev.name,
            image: imgUrl || prev.image,
            images: imgList.length > 0 ? imgList : prev.images,
            description: product.description || prev.description,
            category: matchedCategory || prev.category,
            productId: product.productId || prev.productId,
            price: '', // Shop B sets their own price!
            stock: '1',
            offer: '0'
          }));
          setAutofillSource(data.source === 'pasr_community' ? 'community' : (data.source ? 'catalog' : ''));
          setShowAddModal(true);
        } else {
          setAutofillSource('');
          setNewProduct(prev => ({ ...prev, barcode: cleanBarcode }));
          setShowAddModal(true);
        }
      } else {
        setAutofillSource('');
        setNewProduct(prev => ({ ...prev, barcode: cleanBarcode }));
        setShowAddModal(true);
      }
    } catch (e) {
      console.error('Failed to lookup barcode', e);
      setAutofillSource('');
      setNewProduct(prev => ({ ...prev, barcode: cleanBarcode }));
      setShowAddModal(true);
    } finally {
      setIsScanningLookup(false);
    }
  };

  // Hardware Barcode Scanner Listener (USB / Bluetooth Laser Scanners)
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is actively typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const currentTime = Date.now();
      // Scanners send keystrokes extremely rapidly (< 60ms between keys)
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) {
          handleBarcodeScanned(barcodeBuffer);
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, editingProduct, showEditModal]);

  // Autocomplete debounce logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (newProduct.name.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const res = await fetch(`/api/shop/products/search?q=${encodeURIComponent(newProduct.name)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.suggestions && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    // Simple debounce
    const timeoutId = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timeoutId);
  }, [newProduct.name]);

  const handleSelectSuggestion = (suggestion: any) => {
    const imgUrl = suggestion.img?.url || suggestion.image || '';
    setNewProduct(prev => ({
      ...prev,
      name: suggestion.name,
      barcode: suggestion.barcode || prev.barcode,
      productId: suggestion._id,
      description: suggestion.description || prev.description,
      category: suggestion.category || prev.category,
      image: imgUrl || prev.image,
      images: imgUrl ? [imgUrl] : prev.images
    }));
    setShowSuggestions(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const compressedBase64s: string[] = [];
        for (let i = 0; i < files.length; i++) {
          compressedBase64s.push(await compressImage(files[i], 1));
        }
        setNewProduct(prev => {
          const allImages = [...(prev.images || []), ...compressedBase64s];
          return { ...prev, images: allImages, image: allImages[0] };
        });
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const compressedBase64s: string[] = [];
        for (let i = 0; i < files.length; i++) {
          compressedBase64s.push(await compressImage(files[i], 1));
        }
        setEditingProduct((prev: any) => {
          const allImages = [...(prev.images || []), ...compressedBase64s];
          return { ...prev, images: allImages, image: allImages[0] };
        });
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }
  };

  const handleSelectSharedImage = (selected: any, applyAll: boolean) => {
    if (imageLibraryTarget === 'add') {
      if (applyAll) {
        const availableCategories = SHOP_CATEGORIES[shopCategory as keyof typeof SHOP_CATEGORIES] || SHOP_CATEGORIES['General Store'] || [];
        let matchedCategory = '';
        if (selected.category) {
          const lowerCat = selected.category.toLowerCase();
          const matched = availableCategories.find(c => lowerCat.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(lowerCat));
          if (matched) matchedCategory = matched.name;
        }

        const imgUrl = selected.image || '';
        const imgList = selected.images && selected.images.length > 0 ? selected.images : (imgUrl ? [imgUrl] : []);

        setNewProduct(prev => ({
          ...prev,
          barcode: selected.barcode || prev.barcode,
          name: selected.name || prev.name,
          image: imgUrl || prev.image,
          images: imgList.length > 0 ? imgList : prev.images,
          description: selected.description || prev.description,
          category: matchedCategory || prev.category,
          productId: selected.productId || prev.productId
        }));
      } else {
        const imgUrl = selected.image || '';
        setNewProduct(prev => {
          const allImages = [...(prev.images || []), ...(selected.images || (imgUrl ? [imgUrl] : []))];
          return { ...prev, image: allImages[0] || imgUrl || prev.image, images: allImages };
        });
      }
    } else if (imageLibraryTarget === 'edit' && editingProduct) {
      if (applyAll) {
        const imgUrl = selected.image || '';
        const imgList = selected.images && selected.images.length > 0 ? selected.images : (imgUrl ? [imgUrl] : []);

        setEditingProduct((prev: any) => ({
          ...prev,
          barcode: selected.barcode || prev.barcode,
          name: selected.name || prev.name,
          image: imgUrl || prev.image,
          images: imgList.length > 0 ? imgList : prev.images,
          description: selected.description || prev.description
        }));
      } else {
        const imgUrl = selected.image || '';
        setEditingProduct((prev: any) => {
          const allImages = [...(prev.images || []), ...(selected.images || (imgUrl ? [imgUrl] : []))];
          return { ...prev, image: allImages[0] || imgUrl || prev.image, images: allImages };
        });
      }
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.productId && !newProduct.name) {
      alert('Please provide a product name or select from the recommended items list.');
      return;
    }

    // Check if barcode is already registered in this shop
    if (newProduct.barcode) {
      const existingWithBarcode = findExistingProductByBarcode(newProduct.barcode);
      if (existingWithBarcode) {
        setShowAddModal(false);
        setAlreadyRegisteredProduct({
          product: existingWithBarcode,
          barcode: newProduct.barcode
        });
        return;
      }
    }

    setAddingProduct(true);
    try {
      const payload = {
        ...newProduct,
        discountPercent: newProduct.offer || 0
      };
      const res = await fetch('/api/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      // Handle duplicate product registration error from backend
      if (res.status === 409 || data.alreadyRegistered) {
        setShowAddModal(false);
        const existing = data.existingProduct || (newProduct.barcode ? findExistingProductByBarcode(newProduct.barcode) : null);
        if (existing) {
          setAlreadyRegisteredProduct({
            product: existing,
            barcode: newProduct.barcode || existing.barcode
          });
        } else {
          alert(data.message || 'This product is already registered in your shop catalogue. Please update it.');
        }
        return;
      }

      if (res.ok) {
        setProducts(prev => [
          {
            _id: data.product._id,
            name: newProduct.name,
            price: data.product.price,
            qty: data.product.quantity,
            quantity: data.product.quantity,
            category: newProduct.category,
            description: newProduct.description,
            discount: data.product.discount,
            barcode: newProduct.barcode || data.product.barcode || '',
            loc: '-',
            image: newProduct.image || '/placeholder.png',
            images: newProduct.images && newProduct.images.length > 0 ? newProduct.images : (newProduct.image ? [newProduct.image] : [])
          },
          ...prev
        ]);
        setShowAddModal(false);
        setNewProduct({ name: '', category: '', price: '', stock: '1', description: '', offer: '0', image: '', images: [], productId: '', barcode: '', deliveryType: 'standard', canDeliverByBike: true, preparationTime: '0', maxDeliveryDistance: '10', availableForDelivery: true });
        alert('Product added successfully!');
      } else {
        alert(data.error || data.message || 'Failed to add product');
      }
    } catch (e) {
      alert('Error adding product');
    } finally {
      setAddingProduct(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/shop/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (e) {
      alert('Error deleting product');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.barcode) {
      const otherMatch = findExistingProductByBarcode(editingProduct.barcode);
      if (otherMatch && (otherMatch._id || otherMatch.id) !== (editingProduct._id || editingProduct.id)) {
        alert(`Barcode "${editingProduct.barcode}" is already assigned to "${otherMatch.name || otherMatch.product?.name || 'another product'}". Please use a unique barcode.`);
        return;
      }
    }

    setSavingEdit(true);
    try {
      const payload = {
        price: editingProduct.price,
        stock: editingProduct.quantity || editingProduct.qty,
        discountPercent: editingProduct.discount,
        name: editingProduct.name,
        category: editingProduct.category,
        description: editingProduct.description,
        barcode: editingProduct.barcode || '',
        image: editingProduct.image,
        images: editingProduct.images || (editingProduct.extraImages ? [editingProduct.image, ...editingProduct.extraImages] : [editingProduct.image])
      };
      const res = await fetch(`/api/shop/products/${editingProduct._id || editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setProducts(prev => prev.map(p => (p._id || p.id) === (editingProduct._id || editingProduct.id) ? { 
          ...p, 
          price: editingProduct.price, 
          quantity: editingProduct.quantity || editingProduct.qty, 
          discount: editingProduct.discount,
          name: editingProduct.name,
          barcode: editingProduct.barcode || p.barcode || '',
          itemCategory: editingProduct.category,
          description: editingProduct.description,
          image: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images[0] : (editingProduct.image || ''),
          img: { url: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images[0] : (editingProduct.image || p.img?.url) },
          extraImages: editingProduct.images && editingProduct.images.length > 1 ? editingProduct.images.slice(1).map((url: string) => ({ url })) : []
        } : p));
        setShowEditModal(false);
        setEditingProduct(null);
      } else {
        alert(data.message || data.error || 'Failed to update product');
      }
    } catch (e) {
      alert('Error updating product');
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase().trim();
    const matchesSearch = (p.name || p.product?.name || p.product?.productName || '').toLowerCase().includes(q) ||
      (p.barcode || p.product?.barcode || '').toLowerCase().includes(q);
    const itemCat = p.itemCategory || p.product?.category || p.product?.categories || p.category;
    const matchesCategory = filterCategory === '' || itemCat === filterCategory;
    return matchesSearch && matchesCategory;
  });
  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Catalogue</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your inventory, prices, and product details.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            type="button"
            onClick={() => setShowScanner(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
          >
            <ScanLine size={19} /> Scan Barcode
          </button>
          <button 
            onClick={openAiStudio}
            className="bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={20} className="text-yellow-400" /> AI Catalog Studio
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add New Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by product name or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-12 pr-4 py-3 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 outline-none"
          >
            <option value="">All Categories</option>
            {(SHOP_CATEGORIES[shopCategory as keyof typeof SHOP_CATEGORIES] || SHOP_CATEGORIES['General Store']).map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-6 font-medium">Product</th>
                <th className="p-6 font-medium">Category</th>
                <th className="p-6 font-medium">Price</th>
                <th className="p-6 font-medium">Stock/Qty</th>
                <th className="p-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    Loading your products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    No products found. Click "Add New Product" to get started.
                  </td>
                </tr>
              ) : displayedProducts.map((product) => (
                <tr key={product._id || product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={product.img?.url || product.product?.img?.url || product.product?.productImage?.[0]?.url || product.image || '/placeholder.png'} alt={product.name || product.product?.name || product.product?.productName} className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm" />
                      <div>
                        <p className="font-bold text-gray-900">{product.name || product.product?.name || product.product?.productName}</p>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className="flex items-center text-xs text-gray-500 gap-1">
                            <MapPin size={12} /> {product.loc || 'In Stock'}
                          </span>
                          {(product.barcode || product.product?.barcode) ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60" title="Scannable Barcode">
                              <ScanLine size={11} /> {product.barcode || product.product?.barcode}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-mono">
                              <ScanLine size={11} /> No Barcode
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600">
                      <Tag size={12} /> {product.itemCategory || product.product?.category || product.product?.categories || product.category || 'General'}
                    </span>
                  </td>
                  <td className="p-6">
                    {(() => {
                      const originalPrice = Number(product.price || 0);
                      const discount = Number(product.discount ?? product.discountPercent ?? product.offer ?? product.product?.discount ?? 0);
                      const hasDiscount = discount > 0 && discount < 100;
                      const finalPrice = hasDiscount ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;

                      if (hasDiscount) {
                        return (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-extrabold text-gray-900 text-base">₹{finalPrice}</span>
                              <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
                            </div>
                            <span className="inline-flex items-center w-fit text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                              {discount}% OFF
                            </span>
                          </div>
                        );
                      }
                      return <span className="font-bold text-gray-900 text-base">₹{originalPrice}</span>;
                    })()}
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${(product.quantity || product.qty) > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className="font-semibold text-gray-700">{product.quantity || product.qty} units</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button onClick={() => openEditModalForProduct(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(product._id || product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>Showing {displayedProducts.length > 0 ? 1 : 0} to {displayedProducts.length} of {filteredProducts.length} products</p>
          <div className="flex gap-2">
            {visibleCount < filteredProducts.length && (
              <button 
                onClick={() => setVisibleCount(prev => prev + 10)} 
                className="px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
              >
                Load More (+10)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 overflow-y-auto">
              <div className="space-y-5">
                {autofillSource && (
                  <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 text-emerald-900 text-xs animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <Sparkles size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">
                          {autofillSource === 'community' ? 'Community Registered Details Loaded:' : 'Catalogue Details Loaded:'}
                        </span>{' '}
                        Name, category, and photo auto-filled from database.
                        <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                          Please enter your selling price, offer, and stock quantity below.
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setAutofillSource('')} 
                      className="p-1 text-emerald-500 hover:text-emerald-700 rounded-lg shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">Scan Product Barcode</h4>
                    <p className="text-xs text-indigo-700 mt-0.5">Auto-fill product name and image</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowScanner(true)}
                    disabled={isScanningLookup}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isScanningLookup ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <ScanLine size={14} />
                        Scan
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                  <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Enter item name" />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                      <div className="bg-blue-50/80 px-4 py-2 text-xs font-bold text-blue-600 border-b border-blue-100 flex items-center justify-between">
                        Recommended Items
                        <button type="button" onClick={() => setShowSuggestions(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={14} />
                        </button>
                      </div>
                      {suggestions.slice(0, 8).map((item, idx) => (
                        <div 
                          key={idx} 
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                          onClick={() => handleSelectSuggestion(item)}
                        >
                          {item.img?.url || item.image ? (
                            <img src={item.img?.url || item.image} alt={item.name} className="w-8 h-8 rounded object-cover shadow-sm bg-gray-100 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                              <Box size={14} className="text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 truncate">{item.category || 'General'}</p>
                          </div>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0">Use</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Item Images</label>
                  <div className="flex flex-col gap-3 w-full bg-white border border-gray-300 rounded-lg p-3">
                    {newProduct.images && newProduct.images.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {newProduct.images.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden bg-gray-50">
                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => {
                              const newImages = [...newProduct.images];
                              newImages.splice(i, 1);
                              setNewProduct({...newProduct, images: newImages, image: newImages[0] || ''});
                            }} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className="cursor-pointer bg-[#F5F8FF] text-[#4F46E5] font-bold px-4 py-2 rounded-lg hover:bg-[#E5EDFF] transition-colors shrink-0 text-xs">
                        {newProduct.images && newProduct.images.length > 0 ? 'Add More Images' : 'Choose files'}
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setImageLibraryTarget('add');
                          setShowImageLibrary(true);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3.5 py-2 rounded-lg transition-colors shrink-0 text-xs flex items-center gap-1.5 border border-indigo-200 shadow-sm"
                      >
                        <ImageIcon size={14} /> Browse Shared Images
                      </button>
                      {(!newProduct.images || newProduct.images.length === 0) && (
                        <span className="text-xs font-semibold text-gray-500 truncate flex-1">
                          No files chosen
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" placeholder="Enter item description" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                    <input required type="number" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Offer (%)</label>
                    <input type="number" min="0" max="100" value={newProduct.offer} onChange={e => setNewProduct({...newProduct, offer: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
                  </div>
                </div>
                {Number(newProduct.offer) > 0 && Number(newProduct.price) > 0 && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span>Effective Selling Price after {newProduct.offer}% discount:</span>
                    <span className="font-extrabold text-sm text-emerald-700">₹{Math.round(Number(newProduct.price) * (1 - Number(newProduct.offer) / 100))}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                  <input required type="number" min="1" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="1" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Item Category</label>
                  <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="" disabled>Select Category</option>
                    {(SHOP_CATEGORIES[shopCategory as keyof typeof SHOP_CATEGORIES] || SHOP_CATEGORIES['General Store']).map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.name} {cat.icon}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-gray-700">
                      Barcode / EAN / SKU <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {newProduct.barcode && !newProduct.name && (
                        <button
                          type="button"
                          onClick={() => handleBarcodeScanned(newProduct.barcode)}
                          disabled={isScanningLookup}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors border border-emerald-200"
                        >
                          <Sparkles size={11} /> Auto-Fill
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors border border-indigo-200/50"
                      >
                        <ScanLine size={13} /> Scan with Camera
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={newProduct.barcode || ''} 
                      onChange={e => setNewProduct({...newProduct, barcode: e.target.value.trim()})} 
                      className="w-full text-gray-900 font-mono font-medium bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm placeholder:font-sans" 
                      placeholder="e.g. 8901491101837" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Scan barcode with camera"
                    >
                      <ScanLine size={16} />
                    </button>
                  </div>
                  {(() => {
                    const match = newProduct.barcode ? findExistingProductByBarcode(newProduct.barcode) : null;
                    if (!match) return null;
                    return (
                      <div className="mt-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-amber-900 animate-in fade-in">
                        <div className="flex items-center gap-2.5 text-xs">
                          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                          <div>
                            <div>
                              <span className="font-bold">Already Registered:</span> &ldquo;{match.name || match.product?.name || 'This item'}&rdquo; has this barcode.
                            </div>
                            <div className="text-[11px] text-amber-700 mt-0.5">
                              Price: ₹{match.price} • Stock: {match.quantity || match.qty || 1} units
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddModal(false);
                            openEditModalForProduct(match);
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 transition-colors shadow-sm flex items-center gap-1"
                        >
                          Update Instead <ArrowRight size={12} />
                        </button>
                      </div>
                    );
                  })()}
                </div>


              </div>
              <div className="mt-8 pt-4 flex">
                <button type="submit" disabled={addingProduct} className="w-full px-4 py-3 font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors disabled:opacity-50 text-lg">
                  {addingProduct ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                  <input required type="text" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Product Name" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Item Images</label>
                  <div className="flex flex-col gap-3 w-full bg-white border border-gray-300 rounded-lg p-3">
                    {editingProduct.images && editingProduct.images.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {editingProduct.images.map((img: string, i: number) => (
                          <div key={i} className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden bg-gray-50">
                            <img src={img} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => {
                              const newImages = [...editingProduct.images];
                              newImages.splice(i, 1);
                              setEditingProduct({...editingProduct, images: newImages, image: newImages[0] || ''});
                            }} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    ) : editingProduct.image ? (
                      <div className="relative w-16 h-16 rounded border border-gray-200 overflow-hidden bg-gray-50">
                        <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className="cursor-pointer bg-[#F5F8FF] text-[#4F46E5] font-bold px-4 py-2 rounded-lg hover:bg-[#E5EDFF] transition-colors shrink-0 text-xs">
                        Upload Files
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleEditImageUpload} />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setImageLibraryTarget('edit');
                          setShowImageLibrary(true);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3.5 py-2 rounded-lg transition-colors shrink-0 text-xs flex items-center gap-1.5 border border-indigo-200 shadow-sm"
                      >
                        <ImageIcon size={14} /> Browse Shared Images
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select required value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="" disabled>Select Category</option>
                    {(SHOP_CATEGORIES[shopCategory as keyof typeof SHOP_CATEGORIES] || SHOP_CATEGORIES['General Store']).map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.name} {cat.icon}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                    <input required type="number" min="0" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Discount (%)</label>
                    <input type="number" min="0" max="100" value={editingProduct.discount || ''} onChange={e => setEditingProduct({...editingProduct, discount: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="0" />
                  </div>
                </div>
                {Number(editingProduct.discount) > 0 && Number(editingProduct.price) > 0 && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span>Effective Selling Price after {editingProduct.discount}% discount:</span>
                    <span className="font-extrabold text-sm text-emerald-700">₹{Math.round(Number(editingProduct.price) * (1 - Number(editingProduct.discount) / 100))}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
                  <input required type="number" min="0" value={editingProduct.quantity || editingProduct.qty || ''} onChange={e => setEditingProduct({...editingProduct, quantity: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-gray-700">
                      Barcode / EAN / SKU <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors border border-indigo-200/50"
                    >
                      <ScanLine size={13} /> Scan with Camera
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={editingProduct.barcode || ''} 
                      onChange={e => setEditingProduct({...editingProduct, barcode: e.target.value.trim()})} 
                      className="w-full text-gray-900 font-mono font-medium bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm placeholder:font-sans" 
                      placeholder="e.g. 8901491101837" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Scan barcode with camera"
                    >
                      <ScanLine size={16} />
                    </button>
                  </div>
                  {(() => {
                    if (!editingProduct.barcode) return null;
                    const otherMatch = findExistingProductByBarcode(editingProduct.barcode);
                    if (!otherMatch || (otherMatch._id || otherMatch.id) === (editingProduct._id || editingProduct.id)) return null;
                    return (
                      <div className="mt-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                        <AlertTriangle size={15} className="shrink-0 text-red-500" />
                        <span><strong>Barcode Conflict:</strong> Already assigned to &ldquo;{otherMatch.name || otherMatch.product?.name || 'another item'}&rdquo;.</span>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea rows={2} value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Product details..."></textarea>
                </div>
                <button disabled={savingEdit} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200">
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Already Registered Modal */}
      {alreadyRegisteredProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setAlreadyRegisteredProduct(null)}>
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center border-b border-gray-100 bg-gradient-to-b from-amber-50/70 to-white">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <ScanLine size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Product Already Registered!</h3>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                This product is already in your shop catalogue. You can update its price, stock, or details instead of adding a duplicate.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Product preview card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  {(alreadyRegisteredProduct.product.img?.url || alreadyRegisteredProduct.product.image || alreadyRegisteredProduct.product.product?.img?.url) ? (
                    <img 
                      src={alreadyRegisteredProduct.product.img?.url || alreadyRegisteredProduct.product.image || alreadyRegisteredProduct.product.product?.img?.url} 
                      alt={alreadyRegisteredProduct.product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Box size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm truncate">
                    {alreadyRegisteredProduct.product.name || alreadyRegisteredProduct.product.product?.name || 'Item'}
                  </h4>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    Barcode: <span className="text-gray-800 font-bold">{alreadyRegisteredProduct.barcode || alreadyRegisteredProduct.product.barcode || 'N/A'}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                      ₹{alreadyRegisteredProduct.product.price}
                    </span>
                    <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                      Stock: {alreadyRegisteredProduct.product.quantity || alreadyRegisteredProduct.product.qty || 1} units
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const prod = alreadyRegisteredProduct.product;
                    setAlreadyRegisteredProduct(null);
                    openEditModalForProduct(prod);
                  }}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Edit2 size={16} /> Update Existing Product
                </button>
                <button
                  type="button"
                  onClick={() => setAlreadyRegisteredProduct(null)}
                  className="w-full py-2.5 px-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScannerModal 
          onClose={() => setShowScanner(false)} 
          onScanSuccess={handleBarcodeScanned} 
        />
      )}

      {showAiModal && (
        <AiCatalogModal
          aiCredits={aiCredits}
          onClose={() => setShowAiModal(false)}
          onSuccess={(images) => {
            const visionData = (window as any).__aiVisionData;
            
            setNewProduct(prev => ({ 
              ...prev, 
              image: images[0] || '',
              images: images,
              name: visionData?.title || prev.name,
              description: visionData?.description || prev.description,
              price: visionData?.price || prev.price,
              offer: visionData?.discount || prev.offer
            }));
            
            // Clean up
            (window as any).__aiVisionData = null;
            
            setShowAiModal(false);
            setShowAddModal(true);
          }}
        />
      )}

      {showImageLibrary && (
        <SharedImageLibraryModal
          initialQuery={imageLibraryTarget === 'add' ? newProduct.name : (editingProduct?.name || '')}
          shopCategory={shopCategory}
          onClose={() => setShowImageLibrary(false)}
          onSelectImage={handleSelectSharedImage}
        />
      )}
    </div>
  );
}
