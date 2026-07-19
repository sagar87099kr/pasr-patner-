import Sidebar from '@/components/Sidebar';
import ShopProfileModal from '@/components/ShopProfileModal';
import { Bell, Search, User } from 'lucide-react';
import { cookies } from 'next/headers';
import { BACKEND_BASE_URL } from '@/lib/config';

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let shopName = "My Shop";
  let shopImage = "";
  let activeShopId = "";

  try {
    const cookieStore = await cookies();
    activeShopId = cookieStore.get('active_shop_id')?.value || "";
    const userId = cookieStore.get('pasr_token')?.value;
    
    if (activeShopId && userId) {
    const backendUrl = `${BACKEND_BASE_URL}/api/partner/my-profiles`;
      const res = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${userId}`,
          'Cookie': `pasr_token=${userId}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const shop = data.profiles?.find((p: any) => p._id === activeShopId);
        if (shop) {
          shopName = shop.businessName || "My Shop";
          shopImage = shop.image || "";
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch shop layout info", error);
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
          <div className="flex-1 flex items-center">
            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex items-center bg-gray-100/50 rounded-full px-4 py-2 w-96 border border-gray-200/50 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search size={18} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search orders, products, customers..." 
                className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            
            <ShopProfileModal 
              shopName={shopName} 
              shopImage={shopImage} 
              activeShopId={activeShopId || ''} 
            />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-24 md:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
