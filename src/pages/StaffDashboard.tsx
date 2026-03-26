import React, { useEffect, useState, useRef } from 'react';
import { 
  Navigation, 
  MapPin, 
  Play, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Camera, 
  Loader2, 
  User, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { staffService } from '../services/staffService';
import { StaffBooking, BookingStatus } from '../types';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const StaffDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<StaffBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    fetchBookings();
    return () => {
      stopTimer();
      stopTracking();
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await staffService.getMyBookings();
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const startTracking = () => {
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          staffService.sendLocation(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to track location. Please check permissions.');
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startTimer = () => {
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartJourney = async (id: number) => {
    try {
      await staffService.updateBookingStatus(id, 'on_the_way');
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'on_the_way' } : b)));
      setActiveBookingId(id);
      startTracking();
      toast.success('Journey started! Tracking location.');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleArrived = async (id: number) => {
    try {
      await staffService.updateBookingStatus(id, 'in_progress');
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'in_progress' } : b)));
      stopTracking();
      startTimer();
      toast.success('Arrived! Work timer started.');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleFinish = (id: number) => {
    setActiveBookingId(id);
    setIsModalOpen(true);
  };

  const handleCompleteOrder = async () => {
    if (!activeBookingId) return;
    setIsCompleting(true);
    try {
      await staffService.completeBooking(activeBookingId, {
        notes,
        beforePhoto: beforePhoto || undefined,
        afterPhoto: afterPhoto || undefined,
      });
      setBookings((prev) => prev.map((b) => (b.id === activeBookingId ? { ...b, status: 'completed' } : b)));
      stopTimer();
      setIsModalOpen(false);
      setNotes('');
      setBeforePhoto(null);
      setAfterPhoto(null);
      setActiveBookingId(null);
      toast.success('Order completed successfully!');
    } catch (error) {
      toast.error('Failed to complete order');
    } finally {
      setIsCompleting(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'on_the_way':
        return <Badge variant="info">On the Way</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="neutral">Confirmed</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-solid" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />
      
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-carbon-black">My Tasks</h1>
        <p className="text-text-description text-sm">Manage your daily service schedule and track your progress.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {bookings.map((booking) => (
            <motion.div 
              key={booking.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:bg-emerald-tint/5",
                booking.status === 'on_the_way' ? 'border-emerald-solid/20' : 
                booking.status === 'in_progress' ? 'border-emerald-solid' : 'border-border-light'
              )}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-bg-surface flex items-center justify-center border border-border-light shadow-sm">
                      <User className="h-6 w-6 text-carbon-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-carbon-black">{booking.customer_name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{booking.service_type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock className="h-3.5 w-3.5" />
                      {booking.appointment_time}
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {booking.status === 'confirmed' && (
                    <Button 
                      onClick={() => handleStartJourney(booking.id)}
                      className="btn-emerald h-11 px-8 text-xs"
                    >
                      <Navigation className="mr-2 h-4 w-4" /> Start Journey
                    </Button>
                  )}

                  {booking.status === 'on_the_way' && (
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex items-center gap-2.5 rounded-lg bg-white px-4 py-2 text-[11px] font-bold text-emerald-text border border-emerald-solid/20"
                      >
                        <div className="h-2 w-2 rounded-full bg-emerald-solid animate-pulse" />
                        On the Way
                      </motion.div>
                      <Button 
                        onClick={() => handleArrived(booking.id)}
                        className="bg-carbon-black hover:bg-emerald-solid text-white h-11 px-6 text-xs"
                      >
                        <MapPin className="mr-2 h-4 w-4" /> Arrived & Start Work
                      </Button>
                    </div>
                  )}

                  {booking.status === 'in_progress' && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2.5 rounded-lg bg-white px-4 py-2 text-[11px] font-bold text-amber-600 border border-amber-200">
                        <Clock className="h-4 w-4 animate-pulse" />
                        {formatTime(timer)}
                      </div>
                      <Button 
                        onClick={() => handleFinish(booking.id)}
                        className="btn-emerald h-11 px-6 text-xs"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Finish & Notes
                      </Button>
                    </div>
                  )}

                  {booking.status === 'completed' && (
                    <div className="flex items-center gap-2 text-emerald-solid font-bold text-sm">
                      <CheckCircle2 className="h-5 w-5" />
                      Completed
                    </div>
                  )}
                </div>
              </div>

              {booking.status === 'on_the_way' && (
                <div className="mt-6 flex items-center gap-3 rounded-lg bg-emerald-tint/10 p-4 text-[11px] font-bold text-emerald-text border border-emerald-solid/10">
                  <AlertCircle className="h-4 w-4" />
                  <span>GPS Tracking is active. Drive safely to the customer location.</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Complete Service Order"
      >
        <div className="p-6 space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Job Notes
            </label>
            <textarea 
              className="w-full min-h-[140px] rounded-lg border border-border-thin p-4 text-sm text-carbon-gray focus:ring-2 focus:ring-emerald-solid/10 focus:border-emerald-solid outline-none transition-all bg-white placeholder:text-slate-300"
              placeholder="Describe the work done, any issues encountered, or client requests..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Before Photo</label>
              <div 
                className={`flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                  beforePhoto ? 'border-emerald-solid/20 bg-emerald-tint/10' : 'border-border-light hover:border-emerald-solid hover:bg-emerald-tint/20'
                }`}
                onClick={() => setBeforePhoto('https://picsum.photos/seed/before/400/300')}
              >
                {beforePhoto ? (
                  <img src={beforePhoto} alt="Before" className="h-full w-full rounded-md object-cover" />
                ) : (
                  <>
                    <Camera className="h-6 w-6 text-slate-300" />
                    <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Before</span>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">After Photo</label>
              <div 
                className={`flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                  afterPhoto ? 'border-emerald-solid/20 bg-emerald-tint/10' : 'border-border-light hover:border-emerald-solid hover:bg-emerald-tint/20'
                }`}
                onClick={() => setAfterPhoto('https://picsum.photos/seed/after/400/300')}
              >
                {afterPhoto ? (
                  <img src={afterPhoto} alt="After" className="h-full w-full rounded-md object-cover" />
                ) : (
                  <>
                    <Camera className="h-6 w-6 text-slate-300" />
                    <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload After</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border-light">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs">Cancel</Button>
            <Button 
              onClick={handleCompleteOrder} 
              disabled={isCompleting || !notes}
              className="btn-emerald min-w-[140px] px-6 text-xs h-10"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Completing...
                </>
              ) : (
                'Finish Order'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffDashboard;
