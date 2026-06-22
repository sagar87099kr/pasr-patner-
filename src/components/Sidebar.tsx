'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  Briefcase,
  CalendarCheck,
  Tractor,
  Sprout,
  Truck,
  MapPin,
  Clock
} from 'lucide-react';
import { useState } from 'react';

const roleConfig = {
  shop: {
    title: 'Partner Portal',
    icon: Store,
    navItems: [
      { name: 'Dashboard', href: '/shop', icon: LayoutDashboard },
      { name: 'Orders', href: '/shop/orders', icon: ShoppingCart },
      { name: 'Products', href: '/shop/products', icon: Package },
      { name: 'Settings', href: '/shop/settings', icon: Settings },
    ]
  },
  provider: {
    title: 'Provider Portal',
    icon: Briefcase,
    navItems: [
      { name: 'Dashboard', href: '/provider', icon: LayoutDashboard },
      { name: 'Bookings', href: '/provider/bookings', icon: CalendarCheck },
      { name: 'Services', href: '/provider/services', icon: Package },
      { name: 'Settings', href: '/provider/settings', icon: Settings },
    ]
  },
  farmer: {
    title: 'Farmer Portal',
    icon: Tractor,
    navItems: [
      { name: 'Dashboard', href: '/farmer', icon: LayoutDashboard },
      { name: 'Orders', href: '/farmer/orders', icon: ShoppingCart },
      { name: 'Produce', href: '/farmer/produce', icon: Sprout },
      { name: 'Settings', href: '/farmer/settings', icon: Settings },
    ]
  },
  delivery: {
    title: 'Delivery Portal',
    icon: Truck,
    navItems: [
      { name: 'Dashboard', href: '/delivery', icon: LayoutDashboard },
      { name: 'Active Trips', href: '/delivery/active', icon: MapPin },
      { name: 'History', href: '/delivery/history', icon: Clock },
      { name: 'Settings', href: '/delivery/settings', icon: Settings },
    ]
  }
};

export default function Sidebar({ role = 'shop' }: { role?: 'shop' | 'provider' | 'farmer' | 'delivery' }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    // In a real app, clear cookie/storage
    window.location.href = '/';
  };

  const currentRole = roleConfig[role] || roleConfig.shop;
  const RoleIcon = currentRole.icon;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40
        w-64 h-screen 
        bg-white border-r border-gray-100 shadow-sm
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-50 flex justify-center items-center">
          <img 
            src="/pasrpatner.png" 
            alt="PaSr Partner Logo" 
            className="max-h-16 w-auto object-contain"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {currentRole.navItems.map((item) => {
            const Icon = item.icon;
            // Handle exact match for dashboard, prefix match for subpages
            const isActive = pathname === item.href || (item.href !== `/${role}` && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
