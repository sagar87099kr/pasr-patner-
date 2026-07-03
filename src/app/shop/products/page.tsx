'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, Box, MapPin, X } from 'lucide-react';
import { SHOP_CATEGORIES } from '@/lib/categories';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopCategory, setShopCategory] = useState<string>('General Store');
  const [filterCategory, setFilterCategory] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', category: '', price: '', stock: '1', description: '', offer: '0', image: '', productId: '',
    deliveryType: 'standard', canDeliverByBike: true, preparationTime: '0', maxDeliveryDistance: '10', availableForDelivery: true
  });
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const fetchShopProfile = async () => {
      try {
        const res = await fetch('/api/shop/profile');
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
  }, []);

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
    setNewProduct(prev => ({
      ...prev,
      name: suggestion.name,
      productId: suggestion._id,
      description: suggestion.description || prev.description,
      category: suggestion.category || prev.category,
      image: suggestion.img?.url || suggestion.image || prev.image
    }));
    setShowSuggestions(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct((prev: any) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.productId && !newProduct.name) {
      alert('Please provide a product name or select from the recommended items list.');
      return;
    }
    setAddingProduct(true);
    try {
      const res = await fetch('/api/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(prev => [
          {
            _id: data.product._id,
            name: newProduct.name,
            price: data.product.price,
            qty: data.product.quantity,
            category: newProduct.category,
            loc: '-',
            image: newProduct.image || '/placeholder.png'
          },
          ...prev
        ]);
        setShowAddModal(false);
        setNewProduct({ name: '', category: '', price: '', stock: '1', description: '', offer: '0', image: '', productId: '', deliveryType: 'standard', canDeliverByBike: true, preparationTime: '0', maxDeliveryDistance: '10', availableForDelivery: true });
        alert('Product added successfully!');
      } else {
        alert(data.error || 'Failed to add product');
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
    setSavingEdit(true);
    try {
      const payload = {
        price: editingProduct.price,
        stock: editingProduct.quantity || editingProduct.qty,
        discountPercent: editingProduct.discount,
        name: editingProduct.name,
        category: editingProduct.category,
        description: editingProduct.description,
        image: editingProduct.image
      };
      const res = await fetch(`/api/shop/products/${editingProduct._id || editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => (p._id || p.id) === (editingProduct._id || editingProduct.id) ? { 
          ...p, 
          price: editingProduct.price, 
          quantity: editingProduct.quantity || editingProduct.qty, 
          discount: editingProduct.discount,
          name: editingProduct.name,
          itemCategory: editingProduct.category,
          description: editingProduct.description,
          image: editingProduct.image,
          img: { url: editingProduct.image || p.img?.url }
        } : p));
        setShowEditModal(false);
        setEditingProduct(null);
      } else {
        alert('Failed to update product');
      }
    } catch (e) {
      alert('Error updating product');
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || p.product?.name || p.product?.productName || '').toLowerCase().includes(search.toLowerCase());
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
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add New Product
        </button>
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
                        <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
                          <MapPin size={12} /> {product.loc || 'In Stock'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600">
                      <Tag size={12} /> {product.itemCategory || product.product?.category || product.product?.categories || product.category || 'General'}
                    </span>
                  </td>
                  <td className="p-6 font-bold text-gray-900">₹{product.price}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${(product.quantity || product.qty) > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className="font-semibold text-gray-700">{product.quantity || product.qty} units</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button onClick={() => { 
                        setEditingProduct({
                          ...product, 
                          name: product.name || product.product?.name || '', 
                          category: product.itemCategory || product.category || product.product?.category || '',
                          description: product.description || product.product?.description || '',
                          discount: product.discount || product.discountPercent || 0,
                          image: product.img?.url || product.product?.img?.url || product.image || ''
                        }); 
                        setShowEditModal(true); 
                      }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
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
                      {suggestions.map((item, idx) => (
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">Item Image</label>
                  <div className="flex items-center gap-3 w-full bg-white border border-gray-300 rounded-lg p-2">
                    {newProduct.image && (
                      <div className="shrink-0 w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-50">
                        <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="cursor-pointer bg-[#F5F8FF] text-[#4F46E5] font-bold px-4 py-2 rounded-lg hover:bg-[#E5EDFF] transition-colors shrink-0">
                      {newProduct.image ? 'Change Image' : 'Choose file'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    {!newProduct.image && (
                      <span className="text-sm font-bold text-gray-700 truncate flex-1">
                        No file chosen
                      </span>
                    )}
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">Item Image</label>
                  <div className="flex items-center gap-3 w-full bg-white border border-gray-300 rounded-lg p-2">
                    {editingProduct.image && (
                      <div className="shrink-0 w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-50">
                        <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="cursor-pointer bg-[#F5F8FF] text-[#4F46E5] font-bold px-4 py-2 rounded-lg hover:bg-[#E5EDFF] transition-colors shrink-0">
                      {editingProduct.image ? 'Change Image' : 'Choose file'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleEditImageUpload} />
                    </label>
                    {!editingProduct.image && (
                      <span className="text-sm font-bold text-gray-700 truncate flex-1">
                        No file chosen
                      </span>
                    )}
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
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
                  <input required type="number" min="0" value={editingProduct.quantity || editingProduct.qty || ''} onChange={e => setEditingProduct({...editingProduct, quantity: e.target.value})} className="w-full text-gray-900 font-medium bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-blue-500 focus:border-blue-500 outline-none" />
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
    </div>
  );
}
