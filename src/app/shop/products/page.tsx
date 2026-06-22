'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, Box, MapPin, X } from 'lucide-react';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', category: '', price: '', stock: '1', description: '', offer: '0', image: '' 
  });
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      description: suggestion.description || prev.description,
      category: suggestion.category || prev.category,
      image: suggestion.image || prev.image
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
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
            id: data.product._id,
            name: data.product.name,
            price: data.product.price,
            qty: data.product.quantity,
            category: data.product.category,
            loc: '-',
            image: data.product.img?.url || 'https://images.unsplash.com/photo-1627483262112-039e9a0a0d16?w=200&q=80'
          },
          ...prev
        ]);
        setShowAddModal(false);
        setNewProduct({ name: '', category: '', price: '', stock: '1', description: '', offer: '0', image: '' });
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
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 outline-none">
            <option value="">All Categories</option>
            <option value="Grocery">Grocery</option>
            <option value="Snacks">Snacks</option>
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
              ) : products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm" />
                      <div>
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
                          <MapPin size={12} /> {product.loc}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600">
                      <Tag size={12} /> {product.category}
                    </span>
                  </td>
                  <td className="p-6 font-bold text-gray-900">₹{product.price}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.qty > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className="font-semibold text-gray-700">{product.qty} units</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <p>Showing {products.length > 0 ? 1 : 0} to {products.length} of {products.length} products</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
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
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover shadow-sm bg-gray-100 shrink-0" />
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
                    <label className="cursor-pointer bg-[#F5F8FF] text-[#4F46E5] font-bold px-4 py-2 rounded-lg hover:bg-[#E5EDFF] transition-colors">
                      Choose file
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <span className="text-sm font-bold text-gray-700 truncate flex-1">
                      {newProduct.image ? 'Image selected' : 'No file chosen'}
                    </span>
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
                    <option value="Sweets">Sweets (Mithai)</option>
                    <option value="Namkeen">Namkeen & Savouries</option>
                    <option value="Bakery">Bakery & Cakes</option>
                    <option value="Snacks">Snacks & Fast Food</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Gift Boxes">Gift Boxes</option>
                    <option value="Dairy">Dairy Products</option>
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
    </div>
  );
}
