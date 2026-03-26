import React, { useEffect, useState } from 'react';
import { Clock, Save, Plus, Trash2, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { apiEndpoints } from '../api/endpoints';
import { Availability, Service } from '../types';
import { toast, Toaster } from 'sonner';
import { cn } from '../lib/utils';

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const AvailabilityPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [servicesRes, availabilityRes] = await Promise.all([
        apiEndpoints.getServices(),
        apiEndpoints.getAvailability()
      ]);
      setServices(servicesRes.data);
      setAvailability(availabilityRes.data);
      if (servicesRes.data.length > 0) {
        setSelectedServiceId(servicesRes.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const currentServiceAvailability = availability.filter(a => a.service_id === selectedServiceId);

  const handleAddSlot = (dayIndex: number) => {
    if (!selectedServiceId) return;
    
    const newSlot: Availability = {
      id: Math.random(),
      service_id: selectedServiceId,
      day_of_week: dayIndex,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true,
    };
    
    setAvailability([...availability, newSlot]);
    toast.success(`New slot added for ${DAYS[dayIndex]}`);
  };

  const handleRemoveSlot = (id: number) => {
    setAvailability(availability.filter(a => a.id !== id));
    toast.info('Time slot removed');
  };

  const handleUpdateSlot = (id: number, updates: Partial<Availability>) => {
    setAvailability(availability.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Availability settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-12 w-1/3 bg-bg-surface border border-border-thin rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="h-64 bg-bg-surface border border-border-thin rounded-2xl" />
        <div className="lg:col-span-3 h-96 bg-bg-surface border border-border-thin rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-carbon-black">Service Availability</h1>
          <p className="text-text-description mt-1">Manage custom working hours for each service.</p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} className="btn-emerald h-10 text-xs px-6">
          <Save className="mr-2 h-4 w-4" /> Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Service Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border-light bg-white p-4 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Select Service</h3>
            <div className="space-y-1">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all",
                    selectedServiceId === service.id 
                      ? "bg-emerald-tint/50 text-emerald-text border-l-2 border-emerald-solid" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-carbon-black"
                  )}
                >
                  {service.service_name}
                  {selectedServiceId === service.id && <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-bg-surface border border-border-light p-5">
            <div className="flex items-center gap-2 text-carbon-black mb-2">
              <Calendar className="h-4 w-4 text-emerald-solid" />
              <span className="text-xs font-semibold">Quick Tip</span>
            </div>
            <p className="text-[11px] text-text-description leading-relaxed">
              You can add multiple time slots for the same day to account for breaks or split shifts.
            </p>
          </div>
        </div>

        {/* Availability Timeline */}
        <div className="lg:col-span-3 space-y-6">
          {DAYS.map((dayName, dayIndex) => {
            const daySlots = currentServiceAvailability.filter(s => s.day_of_week === dayIndex);
            
            return (
              <div key={dayName} className="rounded-xl border border-border-light bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-3.5 bg-bg-surface border-b border-border-light">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-carbon-black">{dayName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-border-light text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {daySlots.length} {daySlots.length === 1 ? 'Slot' : 'Slots'}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAddSlot(dayIndex)}
                    className="h-8 text-[10px] font-semibold"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Slot
                  </Button>
                </div>

                <div className="p-6">
                  {daySlots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                      <Clock className="h-6 w-6 mb-2 opacity-20" />
                      <p className="text-xs italic">No availability set for this day</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {daySlots.map((slot, idx) => (
                        <div 
                          key={slot.id} 
                          className={cn(
                            "group flex flex-col sm:flex-row sm:items-center gap-6 p-4 rounded-lg border transition-all",
                            slot.is_available 
                              ? "bg-white border-border-light hover:border-slate-300" 
                              : "bg-bg-surface border-dashed border-border-light opacity-60"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-8">From</span>
                              <input 
                                type="time" 
                                value={slot.start_time}
                                onChange={(e) => handleUpdateSlot(slot.id, { start_time: e.target.value })}
                                className="rounded-md border border-border-thin px-3 py-1.5 text-xs font-semibold text-carbon-black focus:outline-none focus:ring-2 focus:ring-emerald-solid/5 focus:border-emerald-solid transition-all outline-none"
                              />
                            </div>
                            <div className="h-px w-4 bg-border-light hidden sm:block" />
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-8">To</span>
                              <input 
                                type="time" 
                                value={slot.end_time}
                                onChange={(e) => handleUpdateSlot(slot.id, { end_time: e.target.value })}
                                className="rounded-md border border-border-thin px-3 py-1.5 text-xs font-semibold text-carbon-black focus:outline-none focus:ring-2 focus:ring-emerald-solid/5 focus:border-emerald-solid transition-all outline-none"
                              />
                            </div>
                          </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "text-[9px] font-bold uppercase tracking-widest",
                                  slot.is_available ? "text-carbon-black" : "text-slate-400"
                                )}>
                                  {slot.is_available ? 'Active' : 'Paused'}
                                </span>
                                <button 
                                  onClick={() => handleUpdateSlot(slot.id, { is_available: !slot.is_available })}
                                  className={cn(
                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-solid/10",
                                    slot.is_available ? "bg-emerald-solid" : "bg-slate-200"
                                  )}
                                >
                                  <span className={cn(
                                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm",
                                    slot.is_available ? "translate-x-4.5" : "translate-x-1"
                                  )} />
                                </button>
                              </div>
                              <button 
                                onClick={() => handleRemoveSlot(slot.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-carbon-black p-8 text-white overflow-hidden relative border border-white/5">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white/5 rounded-lg border border-white/10">
              <AlertCircle className="h-5 w-5 text-emerald-solid" />
            </div>
            <div>
              <h4 className="text-base font-semibold">Scheduling Logic</h4>
              <p className="text-white/50 text-xs mt-1 max-w-md leading-relaxed">
                The booking system automatically validates requested slots against these rules. 
                End times are calculated based on the service duration you set.
              </p>
            </div>
          </div>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 text-xs h-10 px-6">
            View Booking Rules
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-solid/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
      </div>
    </div>
  );
};

export default AvailabilityPage;
