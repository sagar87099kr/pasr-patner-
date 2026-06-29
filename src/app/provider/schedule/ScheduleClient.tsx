'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, CalendarCheck, Save, Loader2 } from 'lucide-react';

export default function ScheduleClient({ initialDays, activeProviderId }: { initialDays: any[], activeProviderId: string | undefined }) {
  // Map initial array to a dictionary by date for easy lookup
  const initialMap = useMemo(() => {
    const map: Record<string, any> = {};
    if (Array.isArray(initialDays)) {
      initialDays.forEach(day => {
        if (day && day.date) {
          map[day.date] = day;
        }
      });
    }
    return map;
  }, [initialDays]);

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  
  const [scheduleMap, setScheduleMap] = useState<Record<string, any>>(initialMap);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
    
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null); // empty cells
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDateString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (dayString: string) => {
    setSelectedDate(dayString);
    setScheduleMap(prev => {
      const existing = prev[dayString];
      if (!existing) {
         return {
           ...prev,
           [dayString]: { date: dayString, status: 'busy', timeSlots: [] }
         };
      }
      
      const newStatus = existing.status === 'busy' ? 'free' : 'busy';
      return {
        ...prev,
        [dayString]: { 
           ...existing, 
           status: newStatus,
           // Give them a default time slot if they toggle to free and had none
           timeSlots: newStatus === 'free' && (!existing.timeSlots || existing.timeSlots.length === 0) 
              ? [{ start: '09:00', end: '17:00' }] 
              : existing.timeSlots
        }
      };
    });
  };

  const updateSelectedDayStatus = (status: 'free' | 'busy') => {
    if (!selectedDate) return;
    setScheduleMap(prev => ({
      ...prev,
      [selectedDate]: { ...prev[selectedDate], status }
    }));
  };

  const addTimeSlot = () => {
    if (!selectedDate) return;
    setScheduleMap(prev => {
      const day = prev[selectedDate];
      return {
        ...prev,
        [selectedDate]: { ...day, timeSlots: [...(day.timeSlots || []), { start: '09:00', end: '17:00' }] }
      };
    });
  };

  const updateTimeSlot = (index: number, field: 'start' | 'end', value: string) => {
    if (!selectedDate) return;
    setScheduleMap(prev => {
      const day = prev[selectedDate];
      const newSlots = [...(day.timeSlots || [])];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return {
        ...prev,
        [selectedDate]: { ...day, timeSlots: newSlots }
      };
    });
  };

  const removeTimeSlot = (index: number) => {
    if (!selectedDate) return;
    setScheduleMap(prev => {
      const day = prev[selectedDate];
      const newSlots = [...(day.timeSlots || [])];
      newSlots.splice(index, 1);
      return {
        ...prev,
        [selectedDate]: { ...day, timeSlots: newSlots }
      };
    });
  };

  const handleSave = async () => {
    if (!activeProviderId) return alert('No active provider found.');
    setIsSaving(true);
    try {
      const daysArray = Object.values(scheduleMap);
      const res = await fetch('/api/provider/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: daysArray })
      });
      if (!res.ok) throw new Error('Failed to save schedule');
      alert('Schedule saved successfully!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const daysGrid = generateCalendarDays();
  const selectedDayData = selectedDate ? scheduleMap[selectedDate] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-sm font-semibold text-gray-500 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysGrid.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="p-4" />;
            
            const dayStr = formatDateString(date);
            const isSelected = dayStr === selectedDate;
            const dayData = scheduleMap[dayStr];
            
            let bgClass = "bg-gray-50 hover:bg-gray-100";
            if (isSelected) bgClass = "bg-indigo-100 ring-2 ring-indigo-500";
            else if (dayData?.status === 'free') bgClass = "bg-emerald-50 border border-emerald-200";
            else if (dayData?.status === 'busy') bgClass = "bg-red-50 border border-red-200";

            return (
              <button 
                key={dayStr}
                onClick={() => handleDayClick(dayStr)}
                className={`relative p-1 sm:p-3 h-16 sm:h-24 rounded-xl transition-all flex flex-col items-center justify-center ${bgClass}`}
              >
                <span className={`text-sm sm:text-lg font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {date.getDate()}
                </span>
                {dayData && (
                  <span className={`text-[10px] sm:text-xs font-semibold mt-1 px-1 sm:px-2 py-0.5 rounded-full ${dayData.status === 'free' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    <span className="hidden sm:inline">{dayData.status === 'free' ? 'Available' : 'Busy'}</span>
                    <span className="sm:hidden">{dayData.status === 'free' ? 'Avail' : 'Off'}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {selectedDate ? (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {new Date(selectedDate).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-3">Day Status</label>
                <div className="flex p-1 bg-gray-100 rounded-xl">
                  <button 
                    onClick={() => updateSelectedDayStatus('free')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${selectedDayData?.status === 'free' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Available
                  </button>
                  <button 
                    onClick={() => updateSelectedDayStatus('busy')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${selectedDayData?.status === 'busy' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Busy / Off
                  </button>
                </div>
              </div>

              {selectedDayData?.status === 'free' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700">Time Slots</label>
                    <button onClick={addTimeSlot} className="text-indigo-600 hover:text-indigo-700 p-1">
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(!selectedDayData.timeSlots || selectedDayData.timeSlots.length === 0) ? (
                      <p className="text-sm text-gray-500 italic">No time slots added.</p>
                    ) : (
                      selectedDayData.timeSlots.map((slot: any, idx: number) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center w-full gap-2">
                            <input 
                            type="time" 
                            value={slot.start} 
                            onChange={(e) => updateTimeSlot(idx, 'start', e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-full outline-none focus:border-indigo-500" 
                          />
                          <span className="text-gray-400">to</span>
                          <input 
                            type="time" 
                            value={slot.end} 
                            onChange={(e) => updateTimeSlot(idx, 'end', e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-full outline-none focus:border-indigo-500" 
                          />
                          </div>
                          <button onClick={() => removeTimeSlot(idx)} className="text-gray-400 hover:text-red-500 p-1 sm:mt-0">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <CalendarCheck size={48} className="text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Select a Date</h3>
            <p className="text-sm text-gray-500">Click on any date in the calendar to manage availability and time slots.</p>
          </div>
        )}
      </div>
    </div>
  );
}
