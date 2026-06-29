import { Sprout } from 'lucide-react';

export default function FarmerProduce() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Produce Catalog</h1>
        <p className="text-gray-500 text-sm mt-1">Manage the crops and items you are currently selling.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <Sprout className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No produce listed</h2>
        <p className="text-gray-500 mb-6">You haven't added any crops or items to your catalog yet.</p>
        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          Add New Produce
        </button>
      </div>
    </div>
  );
}
