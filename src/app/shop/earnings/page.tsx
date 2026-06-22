'use client';

import { Download, IndianRupee, ArrowUpRight, Calendar, ArrowDownLeft } from 'lucide-react';

const dummyTransactions = [
  { id: "TXN-00123", orderId: "ORD-9820", type: "credit", amount: 320, method: "UPI", date: "Today, 09:15 AM", status: "Completed" },
  { id: "TXN-00122", orderId: "ORD-9819", type: "credit", amount: 1250, method: "Cash", date: "Yesterday, 04:30 PM", status: "Completed" },
  { id: "TXN-00121", orderId: "N/A", type: "debit", amount: 50, method: "Platform Fee", date: "Yesterday, 04:30 PM", status: "Completed" },
  { id: "TXN-00120", orderId: "ORD-9815", type: "credit", amount: 840, method: "UPI", date: "22 May, 11:20 AM", status: "Pending Settlement" },
];

export default function EarningsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings & Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Track your revenue and transaction history.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-3xl shadow-md text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-100 mb-2">
              <IndianRupee size={20} /> Total Earned (This Month)
            </div>
            <h2 className="text-4xl font-extrabold">₹45,250</h2>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-300">
              <ArrowUpRight size={16} /> +12.5% from last month
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium mb-1">UPI / Online Orders</p>
          <h3 className="text-3xl font-bold text-gray-900">₹32,500</h3>
          <p className="text-sm text-emerald-600 font-semibold mt-2">Fully Settled</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 font-medium mb-1">Cash on Delivery</p>
          <h3 className="text-3xl font-bold text-gray-900">₹12,750</h3>
          <p className="text-sm text-amber-600 font-semibold mt-2">₹1,250 Pending Collection</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
          <button className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">
            <Calendar size={16} /> Filter by Date
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm font-semibold uppercase tracking-wider">
                <th className="p-6 font-medium">Transaction ID</th>
                <th className="p-6 font-medium">Order ID</th>
                <th className="p-6 font-medium">Method</th>
                <th className="p-6 font-medium">Date</th>
                <th className="p-6 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dummyTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <p className="font-bold text-gray-900">{txn.id}</p>
                    <p className={`text-xs font-semibold mt-1 ${txn.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {txn.status}
                    </p>
                  </td>
                  <td className="p-6 font-medium text-gray-600">{txn.orderId}</td>
                  <td className="p-6 text-gray-600">{txn.method}</td>
                  <td className="p-6 text-gray-500 text-sm">{txn.date}</td>
                  <td className="p-6 text-right">
                    <div className={`flex items-center justify-end gap-1 font-bold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {txn.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      ₹{txn.amount}
                    </div>
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
