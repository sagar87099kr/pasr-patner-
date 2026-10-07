'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Image as ImageIcon, Sparkles, Check, CheckCircle2, Layers, ShoppingBag } from 'lucide-react';

interface SharedImageLibraryModalProps {
  initialQuery?: string;
  shopCategory?: string;
  onSelectImage: (item: {
    image: string;
    images: string[];
    name?: string;
    description?: string;
    category?: string;
    productId?: string;
  }, applyAll: boolean) => void;
  onClose: () => void;
}

const CATEGORY_TAGS = [
  'All',
  'Staples & Grains',
  'Snacks & Namkeen',
  'Beverages',
  'Dairy & Refrigerator',
  'Bakery Items',
  'Personal Care',
  'Home Cleaning & Household',
  'Spices & Masala',
  'Edible Oil & Ghee',
  'Instant & Ready to Eat',
  'Electronics',
  'Fashion'
];

export default function SharedImageLibraryModal({
  initialQuery = '',
  shopCategory = 'Grocery',
  onSelectImage,
  onClose
}: SharedImageLibraryModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchImages = useCallback(async (searchQuery: string, category: string) => {
    setLoading(true);
    try {
      const q = searchQuery.trim() || category;
      if (!q || q === 'All') {
        // Fetch default popular items
        const res = await fetch(`/api/shop/products/search?q=a`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.suggestions || []);
        }
      } else {
        const res = await fetch(`/api/shop/products/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          let items = data.suggestions || [];
          if (category !== 'All') {
            items = items.filter((it: any) => 
              (it.category && it.category.toLowerCase().includes(category.toLowerCase())) ||
              (it.name && it.name.toLowerCase().includes(category.toLowerCase()))
            );
          }
          setResults(items);
        }
      }
    } catch (e) {
      console.error('Failed to fetch shared images', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchImages(query, selectedCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selectedCategory, fetchImages]);

  const handleApply = (applyAll: boolean) => {
    if (!selectedItem) return;
    const imgUrl = selectedItem.image || selectedItem.img?.url || '';
    onSelectImage({
      image: imgUrl,
      images: imgUrl ? [imgUrl] : [],
      name: selectedItem.name,
      description: selectedItem.description,
      category: selectedItem.category,
      productId: selectedItem._id
    }, applyAll);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[70] flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <ImageIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">Community Image Library</h3>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">Shared</span>
              </div>
              <p className="text-xs text-gray-500">Use high-quality product images from other shops & PASR catalog</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50/50 shrink-0">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product (e.g. Maggi, Parle-G, Amul Butter, Dettol, Rice, Atta, Oil)..."
              className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {CATEGORY_TAGS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="p-4 overflow-y-auto flex-1 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-medium">Finding shared images...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <ShoppingBag size={24} />
              </div>
              <h4 className="text-sm font-bold text-gray-800">No matching images found</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Try searching for a simpler keyword (e.g. "Tea", "Soap", "Milk", "Biscuit") or scan the barcode.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {results.map((item, idx) => {
                const imgUrl = item.image || item.img?.url;
                if (!imgUrl) return null;
                const isSelected = selectedItem?._id === item._id || selectedItem?.image === imgUrl;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedItem(item)}
                    className={`group relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col bg-white ${
                      isSelected
                        ? 'border-indigo-600 shadow-md ring-2 ring-indigo-600/20'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Image Box */}
                    <div className="aspect-square w-full bg-gray-50 overflow-hidden relative flex items-center justify-center p-2">
                      <img 
                        src={imgUrl} 
                        alt={item.name} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                          <Check size={14} />
                        </div>
                      )}

                      {item.source && (
                        <span className={`absolute bottom-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm ${
                          item.source === 'catalog' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-emerald-600 text-white'
                        }`}>
                          {item.source === 'catalog' ? 'Official Catalog' : 'Shop Shared'}
                        </span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between border-t border-gray-100">
                      <div>
                        <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                          {item.category || shopCategory}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            onSelectImage({
                              image: imgUrl,
                              images: [imgUrl],
                              name: item.name,
                              description: item.description,
                              category: item.category,
                              productId: item._id
                            }, false);
                            onClose();
                          }}
                          className="w-full text-center text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-1 px-2 rounded-lg transition-colors"
                        >
                          Use Image
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {selectedItem && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
              <img 
                src={selectedItem.image || selectedItem.img?.url} 
                alt="Selected" 
                className="w-10 h-10 rounded-xl object-contain bg-white border border-gray-200 shrink-0 p-0.5" 
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">{selectedItem.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{selectedItem.category || 'Product selected'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleApply(false)}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Use Image Only
              </button>
              <button
                type="button"
                onClick={() => handleApply(true)}
                className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} className="text-yellow-300" />
                Apply All (Image + Info)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
