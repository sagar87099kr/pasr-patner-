import { Settings } from 'lucide-react';

export default function FarmerSettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your farm profile and account settings.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <Settings className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Settings Coming Soon</h2>
        <p className="text-gray-500">Profile and account settings will be available here.</p>
      </div>
    </div>
  );
}
