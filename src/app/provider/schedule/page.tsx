import { cookies } from 'next/headers';
import ScheduleClient from './ScheduleClient';

export default async function ProviderSchedule() {
  const cookieStore = await cookies();
  const activeProviderId = cookieStore.get('active_provider_id')?.value;
  const userId = cookieStore.get('pasr_token')?.value;

  let existingDays = [];

  if (activeProviderId && userId) {
    try {
      const backendUrl = `${process.env.BACKEND_URL || 'https://www.pasr.in'}/provider/${activeProviderId}/profile`;
      const res = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${userId}`,
          'Cookie': `pasr_token=${userId}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.success && data.existingDays) {
            existingDays = data.existingDays;
          }
        } else {
          console.warn("Schedule fetch: Backend returned non-JSON response");
        }
      }
    } catch (err) {
      console.error("Failed to fetch existing schedule", err);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your availability and working days.</p>
      </div>
      
      <ScheduleClient initialDays={existingDays} activeProviderId={activeProviderId} />
    </div>
  );
}
