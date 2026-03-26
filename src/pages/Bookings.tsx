import React, { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Plus, Calendar, User, DollarSign } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { apiEndpoints } from '../api/endpoints';
import { Booking, Service, Availability } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { toast, Toaster } from 'sonner';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState('');
  
  // New Booking State
  const [newBooking, setNewBooking] = useState({
    user_name: '',
    service_id: 0,
    booking_date: '',
    start_time: '09:00',
    hours: 1,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, servicesRes, availabilityRes] = await Promise.all([
        apiEndpoints.getBookings(),
        apiEndpoints.getServices(),
        apiEndpoints.getAvailability()
      ]);
      setBookings(bookingsRes.data);
      setServices(servicesRes.data);
      setAvailability(availabilityRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEndTime = (startTime: string, hours: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const endH = (h + hours);
    const wrappedH = endH % 24;
    return `${wrappedH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const validateAvailability = () => {
    const date = new Date(newBooking.booking_date);
    const dayOfWeek = date.getDay();
    const endTime = calculateEndTime(newBooking.start_time, newBooking.hours);
    
    const serviceAvailability = availability.filter(a => 
      a.service_id === Number(newBooking.service_id) && 
      a.day_of_week === dayOfWeek &&
      a.is_available
    );

    if (serviceAvailability.length === 0) return false;

    // Check if the requested slot fits into any available slot
    return serviceAvailability.some(slot => {
      return newBooking.start_time >= slot.start_time && endTime <= slot.end_time;
    });
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAvailability()) {
      toast.error('The selected time slot is outside the service availability hours.');
      return;
    }

    const selectedService = services.find(s => s.id === Number(newBooking.service_id));
    const booking: Booking = {
      id: Math.random(),
      user_id: Math.floor(Math.random() * 1000),
      user_name: newBooking.user_name,
      service_id: Number(newBooking.service_id),
      service_name: selectedService?.service_name || '',
      booking_date: newBooking.booking_date,
      start_time: newBooking.start_time,
      hours: newBooking.hours,
      total_price: (selectedService?.price_today || 0) * newBooking.hours,
      status: 'confirmed',
      payment_status: 'unpaid',
      notes: newBooking.notes
    };

    setBookings([booking, ...bookings]);
    setIsModalOpen(false);
    toast.success('Booking created successfully!');
  };

  const handleStatusChange = async (id: number, newStatus: Booking['status']) => {
    try {
      await apiEndpoints.updateBookingStatus(id, newStatus);
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
      toast.success(`Booking ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.user_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.service_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      header: 'Customer', 
      accessor: (b: Booking) => (
        <div>
          <div className="font-semibold text-carbon-black">{b.user_name}</div>
          <div className="text-xs text-cool-gray">ID: #{b.user_id}</div>
        </div>
      )
    },
    { header: 'Service', accessor: (b: Booking) => b.service_name },
    { 
      header: 'Schedule', 
      accessor: (b: Booking) => (
        <div>
          <div className="font-semibold text-carbon-black">{b.booking_date}</div>
          <div className="text-xs text-cool-gray">
            {b.start_time} ({b.hours}h) → {calculateEndTime(b.start_time, b.hours)}
          </div>
        </div>
      ) 
    },
    { 
      header: 'Status', 
      accessor: (b: Booking) => (
        <Badge variant={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'error'}>
          {b.status}
        </Badge>
      ) 
    },
    { 
      header: 'Payment', 
      accessor: (b: Booking) => (
        <Badge variant={b.payment_status === 'paid' ? 'info' : 'neutral'}>
          {b.payment_status}
        </Badge>
      ) 
    },
    { header: 'Total', accessor: (b: Booking) => formatCurrency(b.total_price) },
    { 
      header: 'Notes', 
      accessor: (b: Booking) => {
        if (!b.notes) return <span className="text-cool-gray italic text-xs">No notes</span>;
        const words = b.notes.split(' ');
        const isTruncated = words.length > 10;
        const displayNote = isTruncated ? words.slice(0, 10).join(' ') + '...' : b.notes;
        
        return (
          <button 
            onClick={() => {
              setSelectedNote(b.notes || '');
              setIsNotesModalOpen(true);
            }}
            className="text-xs text-cool-gray hover:text-brand-blue-600 text-left transition-colors max-w-[200px] block truncate"
            title={isTruncated ? "Click to see full note" : ""}
          >
            {displayNote}
          </button>
        );
      }
    },
    { 
      header: 'Actions', 
      accessor: (b: Booking) => (
        <div className="flex items-center gap-2">
          {b.status === 'pending' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleStatusChange(b.id, 'confirmed')} className="text-brand-blue-600 hover:bg-hover-highlight">
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleStatusChange(b.id, 'cancelled')} className="text-rose-600 hover:bg-rose-50">
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          {b.status === 'confirmed' && (
            <Button variant="ghost" size="sm" onClick={() => handleStatusChange(b.id, 'cancelled')} className="text-rose-600 hover:bg-rose-50">
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      className: 'text-right'
    },
  ];

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-carbon-black">Bookings</h1>
          <p className="text-text-description mt-1">Manage and track your service orders.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="btn-emerald">
          <Plus className="mr-2 h-4 w-4" /> New Booking
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search by customer or service..." 
            className="pl-10 h-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="h-10 rounded-lg border border-border-thin bg-white px-3 py-2 text-sm text-carbon-gray focus:outline-none focus:ring-2 focus:ring-emerald-solid/10 focus:border-emerald-solid transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button variant="outline" className="h-10 text-xs">
            <Filter className="mr-2 h-3.5 w-3.5" /> More Filters
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={filteredBookings} isLoading={isLoading} />

      {/* New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[2px]">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border-light">
            <div className="p-6 border-b border-border-light flex items-center justify-between bg-bg-surface">
              <div>
                <h3 className="text-lg font-semibold text-carbon-black">Create New Booking</h3>
                <p className="text-xs text-text-description mt-1">Fill in the details to schedule a new service.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-carbon-black transition-colors">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBooking} className="p-6 space-y-6">
              <div className="space-y-5">
                <div className="relative">
                  <User className="absolute left-3.5 top-9.5 h-4 w-4 text-slate-400" />
                  <Input 
                    label="Customer Name" 
                    placeholder="Enter customer name" 
                    className="pl-10"
                    value={newBooking.user_name}
                    onChange={(e) => setNewBooking({ ...newBooking, user_name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Service</label>
                  <select 
                    className="flex h-10 w-full rounded-lg border border-border-thin bg-white px-4 py-2 text-sm text-carbon-gray focus:outline-none focus:ring-2 focus:ring-emerald-solid/10 focus:border-emerald-solid transition-all outline-none"
                    value={newBooking.service_id}
                    onChange={(e) => setNewBooking({ ...newBooking, service_id: Number(e.target.value) })}
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.service_name} (${s.price_today}/hr)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-9.5 h-4 w-4 text-slate-400" />
                    <Input 
                      label="Date" 
                      type="date" 
                      className="pl-10"
                      value={newBooking.booking_date}
                      onChange={(e) => setNewBooking({ ...newBooking, booking_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-9.5 h-4 w-4 text-slate-400" />
                    <Input 
                      label="Start Time" 
                      type="time" 
                      className="pl-10"
                      value={newBooking.start_time}
                      onChange={(e) => setNewBooking({ ...newBooking, start_time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <Input 
                    label="Duration (Hours)" 
                    type="number" 
                    min="1"
                    value={newBooking.hours}
                    onChange={(e) => setNewBooking({ ...newBooking, hours: Number(e.target.value) })}
                    required
                  />
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">End Time</label>
                    <div className="h-10 flex items-center px-4 rounded-lg bg-slate-50 border border-border-thin text-sm font-medium text-slate-500">
                      {calculateEndTime(newBooking.start_time, newBooking.hours)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Notes</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-lg border border-border-thin bg-white px-4 py-3 text-sm text-carbon-gray focus:outline-none focus:ring-2 focus:ring-emerald-solid/10 focus:border-emerald-solid transition-all outline-none placeholder:text-slate-300"
                    placeholder="Add any special instructions or notes..."
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between border-t border-border-light">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-solid" />
                  <span className="text-2xl font-bold text-carbon-black">
                    {formatCurrency((services.find(s => s.id === Number(newBooking.service_id))?.price_today || 0) * newBooking.hours)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="text-xs">Cancel</Button>
                  <Button type="submit" className="px-6 btn-emerald text-xs h-10">Confirm Booking</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Notes Detail Modal */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-carbon-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border-thin">
            <div className="p-6 border-b border-border-thin flex items-center justify-between bg-bg-surface">
              <h3 className="text-xl font-bold text-carbon-black">Booking Notes</h3>
              <button onClick={() => setIsNotesModalOpen(false)} className="text-cool-gray hover:text-carbon-black transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-bg-surface rounded-xl p-4 border border-border-thin min-h-[150px]">
                <p className="text-cool-gray leading-relaxed whitespace-pre-wrap">
                  {selectedNote}
                </p>
              </div>
            </div>
            <div className="p-4 bg-bg-surface border-t border-border-thin flex justify-end">
              <Button onClick={() => setIsNotesModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
