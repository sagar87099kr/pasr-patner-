'use client';

import { Users, UserPlus, Heart, Phone, MapPin, Mail } from 'lucide-react';

const dummyCustomers = [
  { id: "CUST-01", name: "Rahul Verma", phone: "9876543210", email: "rahul@example.com", totalOrders: 15, totalSpent: 4500, lastOrder: "Today", type: "Repeat", address: "Koderma Road" },
  { id: "CUST-02", name: "Sunita Devi", phone: "8765432109", email: "", totalOrders: 1, totalSpent: 320, lastOrder: "Today", type: "New", address: "Main Market, Dhanwar" },
  { id: "CUST-03", name: "Anil Kumar", phone: "7654321098", email: "anil.k@example.com", totalOrders: 4, totalSpent: 1850, lastOrder: "Yesterday", type: "Repeat", address: "Station Road, Giridih" },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your customer relationships and view order history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">1,248</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center">
            <UserPlus size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">New This Month</p>
            <h3 className="text-2xl font-bold text-gray-900">84</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Heart size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Repeat Customers</p>
            <h3 className="text-2xl font-bold text-gray-900">65%</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-6 font-medium">Customer Details</th>
                <th className="p-6 font-medium">Contact</th>
                <th className="p-6 font-medium">Total Orders</th>
                <th className="p-6 font-medium text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dummyCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{cust.name}</p>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${cust.type === 'New' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'}`}>
                          {cust.type}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {cust.phone}</div>
                    {cust.email && <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400"/> {cust.email}</div>}
                    <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400"/> {cust.address}</div>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-gray-900">{cust.totalOrders}</p>
                    <p className="text-xs text-gray-500 mt-1">Last: {cust.lastOrder}</p>
                  </td>
                  <td className="p-6 text-right font-bold text-indigo-600">
                    ₹{cust.totalSpent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
