import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  User,
  Briefcase,
  Loader2,
  Phone,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  StickyNote,
  Timer,
  Wallet,
} from "lucide-react";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { bookingApi } from "../services/bookingApi";
import { Booking } from "../types";
import { formatCurrency } from "../lib/utils";
import { toast, Toaster } from "sonner";

interface Staff {
  id: number;
  name: string;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, staffRes] = await Promise.all([
        bookingApi.getBookings(),
        bookingApi.getStaff(),
      ]);
      setBookings(bookingsRes.data || []);
      setStaffMembers(staffRes.data || []);
    } catch (error) {
      toast.error("Failed to sync data with server");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchContent =
        `${booking.user?.name} ${booking.user_name} ${booking.id} ${booking.service?.service_name} ${booking.notes}`.toLowerCase();
      const matchesSearch = searchContent.includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const handleConfirmBooking = async () => {
    if (!selectedStaffId || !selectedBookingId)
      return toast.error("Please select a staff member");
    setIsUpdatingStatus(true);
    try {
      await bookingApi.updateBookingStatus(selectedBookingId, "confirmed", {
        staff_id: selectedStaffId,
      });
      toast.success("Booking confirmed successfully!");
      setIsStaffModalOpen(false);
      fetchInitialData();
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    setIsLoading(true);
    try {
      await bookingApi.updateBookingStatus(id, "cancelled");
      toast.warning("Booking has been cancelled");
      fetchInitialData();
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      header: "Customer",
      accessor: (b: any) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            setSelectedUser(b.user);
            setIsUserModalOpen(true);
          }}
        >
          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 transition-colors">
            <User size={18} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 group-hover:underline">
              {b.user?.name || "Guest User"}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">
              ID: #{b.id}
            </div>
          </div>
        </div>
      ),
    },

    {
      header: "Schedule",
      accessor: (b: any) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Calendar size={13} className="text-slate-400" /> {b.booking_date}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock size={13} className="text-slate-400" />{" "}
            {b.start_time.substring(0, 5)}
            <span className="mx-1 text-slate-300">|</span>
            <Timer size={13} className="text-slate-400" /> {b.hours}h
          </div>
        </div>
      ),
    },
    {
      header: "Service & Staff",
      accessor: (b: any) => (
        <div className="space-y-1">
          <Badge
            variant="outline"
            className="text-slate-700 max-w-[120px] truncate"
          >
            {b.service?.service_name}
          </Badge>
          {b.staff && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <Briefcase size={12} /> {b.staff.name}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Notes",
      accessor: (b: any) => (
        <div className="max-w-[150px]">
          {b.notes ? (
            <div className="flex items-start gap-1.5 text-[11px] text-slate-500 italic leading-tight">
              <StickyNote
                size={12}
                className="mt-0.5 shrink-0 text-amber-400"
              />
              <span className="line-clamp-2">{b.notes}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-300 italic">No notes</span>
          )}
        </div>
      ),
    },
    {
      header: "Total",
      accessor: (b: any) => (
        <div className="space-y-1">
          <div className="font-bold text-slate-900">
            {formatCurrency(b.total_price)}
          </div>
          <Badge
            variant={b.payment_status === "paid" ? "success" : "warning"}
            className="text-[9px] px-1.5 h-4 uppercase"
          >
            {b.payment_status}
          </Badge>
        </div>
      ),
    },
    {
      header: "Payment & Total",
      accessor: (b: any) => {
        // تحديد استايل خاص لكل حالة دفع
        const paymentStyles: Record<string, { label: string; variant: any }> = {
          paid: { label: "Paid", variant: "success" },
          pending: { label: "Pending", variant: "warning" },
          unpaid: { label: "Unpaid", variant: "error" },
        };

        const currentStyle = paymentStyles[b.payment_status] || {
          label: b.payment_status,
          variant: "outline",
        };

        return (
          <div className="space-y-1">
            <div className="font-bold text-slate-900">
              {formatCurrency(b.total_price)}
            </div>
            <Badge
              variant={currentStyle.variant}
              className="text-[10px] px-2 h-5 uppercase font-bold tracking-wider"
            >
              <div className="flex items-center gap-1">
                <Wallet size={10} />
                {currentStyle.label}
              </div>
            </Badge>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: (b: any) => (
        <Badge
          variant={
            b.status === "confirmed"
              ? "success"
              : b.status === "pending"
                ? "warning"
                : b.status === "completed"
                  ? "info"
                  : "error"
          }
        >
          {b.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (b: any) => (
        <div className="flex items-center gap-1">
          {b.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600 border-emerald-100 hover:bg-emerald-50 h-8 px-2 text-[10px] font-bold"
              onClick={() => {
                setSelectedBookingId(b.id);
                setSelectedStaffId("");
                setIsStaffModalOpen(true);
              }}
            >
              CONFIRM
            </Button>
          )}
          {b.status !== "cancelled" && b.status !== "completed" && (
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-300 h-8 w-8 p-0 hover:text-rose-600 hover:bg-rose-50"
              onClick={() => handleCancelBooking(b.id)}
            >
              <Trash2 size={16} />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-300 h-8 w-8 p-0 hover:text-blue-500"
            onClick={fetchInitialData}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" richColors />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Booking Management
        </h2>
        <div className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
          Total: {filteredBookings.length}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search name, service, or notes..."
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-3 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/20 h-11 min-w-[150px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredBookings}
          isLoading={isLoading}
        />
      </div>

      {/* MODAL: Assign Staff */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">
                Assign & Confirm
              </h3>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Select Staff Member
                </label>
                <select
                  className="w-full h-12 rounded-xl border-2 border-slate-100 px-4 text-sm font-medium outline-none focus:border-emerald-500 transition-all"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  <option value="">Choose Professional...</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                className="w-full h-12 btn-emerald font-bold"
                onClick={handleConfirmBooking}
                disabled={isUpdatingStatus || !selectedStaffId}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  "FINALIZE BOOKING"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: User Profile */}
      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-6 text-center text-white relative">
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
              >
                <XCircle size={20} />
              </button>
              <div className="w-16 h-16 bg-emerald-500 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold border-4 border-slate-800 uppercase">
                {selectedUser.name.charAt(0)}
              </div>
              <h4 className="text-lg font-bold">{selectedUser.name}</h4>
              <p className="text-xs text-slate-400">{selectedUser.email}</p>
            </div>
            <div className="p-6 space-y-3 text-center">
              <div className="flex items-center justify-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Phone size={16} className="text-emerald-600" />
                <span className="text-sm font-medium font-mono">
                  {selectedUser.phone || "No phone provided"}
                </span>
              </div>
              <Button
                className="w-full btn-emerald"
                onClick={() => setIsUserModalOpen(false)}
              >
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
