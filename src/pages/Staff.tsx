import React, { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Mail,
  RefreshCw,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
// استيراد مكونات الخريطة
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// تعريف الأيقونة باستخدام روابط مباشرة (CDN) لضمان ظهورها في Vite/React
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// تثبيت الأيقونة كخيار افتراضي لكل الماركرز
L.Marker.prototype.options.icon = DefaultIcon;

// المكونات الداخلية (تأكد من مسارات الملفات عندك)
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { staffApi } from "../services/staffApi";
import { Staff } from "../types";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

// مكون لتحديث مركز الخريطة تلقائياً عند تغيير الإحداثيات
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
};

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "tracking">("list");

  // حالات التتبع (Tracking States)
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // دالة جلب الموقع من الباك أند (الذي يقرأ من Redis)
  const fetchStaffLocation = useCallback(async (id: number) => {
    try {
      const res = await staffApi.getStaffLocation(id);

      // Axios دايماً بيحط رد السيرفر جوه res.data
      // والـ Laravel عندك باعت الـ lat والـ lng بره علطول (Flat JSON)
      const serverResponse = res.data;

      if (serverResponse && serverResponse.lat && serverResponse.lng) {
        setCurrentLocation({
          lat: parseFloat(serverResponse.lat),
          lng: parseFloat(serverResponse.lng),
        });
        console.log("📍 تم تحديث الموقع بنجاح:", serverResponse);
      } else {
        // لو دخل هنا يبقى الـ Laravel رجع 200 بس الداتا مش كاملة (أوفلاين مثلاً)
        console.log(
          "⚠️ الداتا وصلت بس ناقصة أو الموظف أوفلاين:",
          serverResponse,
        );
        setCurrentLocation(null);
      }
    } catch (error: any) {
      // لو الـ Laravel رجع 404 (Staff is not active) هيدخل هنا
      console.error(
        "❌ فشل جلب الموقع:",
        error.response?.data?.message || error.message,
      );
      setCurrentLocation(null);
    }
  }, []);

  // Loop التتبع: يشتغل فقط لما نكون فاتحين الـ Tracking واختارنا موظف
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === "tracking" && selectedStaffId) {
      fetchStaffLocation(selectedStaffId);
      interval = setInterval(() => fetchStaffLocation(selectedStaffId), 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, selectedStaffId, fetchStaffLocation]);

  const normalizeStaffData = (data: any): Staff => ({
    ...data,
    full_name: data.full_name || data.name || "N/A",
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await staffApi.getStaff();
      const rawData = res.data || res;
      const normalizedData = Array.isArray(rawData)
        ? rawData.map(normalizeStaffData)
        : [];
      setStaff(normalizedData);
    } catch (error: any) {
      toast.error("Could not load staff list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const staffData: any = {
      full_name: formData.get("full_name"),
      name: formData.get("full_name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
    };
    const password = formData.get("password") as string;
    if (password) staffData.password = password;

    try {
      if (editingStaff) {
        const res = await staffApi.updateStaff(editingStaff.id, staffData);
        const updated = normalizeStaffData(res.data || res);
        setStaff(staff.map((s) => (s.id === editingStaff.id ? updated : s)));
        toast.success("Staff member updated");
      } else {
        const res = await staffApi.createStaff(staffData);
        setStaff((prev) => [normalizeStaffData(res.data || res), ...prev]);
        toast.success("Staff member added");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: "Staff Member",
      accessor: (s: Staff) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-border-thin">
            <User className="h-5 w-5 text-carbon-black" />
          </div>
          <div>
            <div className="font-bold text-carbon-black text-sm">
              {s.full_name}
            </div>
            <div className="text-[11px] text-cool-gray">{s.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Live Tracking",
      accessor: (s: Staff) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedStaffId(s.id);
            setActiveTab("tracking");
          }}
          className="text-emerald-600 hover:bg-emerald-50 gap-2"
        >
          <MapPin className="h-4 w-4" /> Track Location
        </Button>
      ),
    },
    {
      header: "Actions",
      accessor: (s: Staff) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingStaff(s);
              setIsModalOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(s.id)}
            className="text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this staff member?")) {
      try {
        await staffApi.deleteStaff(id);
        setStaff(staff.filter((s) => s.id !== id));
        toast.success("Deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  return (
    <div className="space-y-8 p-4">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-carbon-black">
            Staff Management
          </h1>
          <p className="text-sm text-text-description">
            Manage and track your service providers live.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border">
            <button
              onClick={() => setActiveTab("list")}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold",
                activeTab === "list" ? "bg-white shadow-sm" : "text-slate-400",
              )}
            >
              List View
            </button>
            <button
              onClick={() => setActiveTab("tracking")}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold",
                activeTab === "tracking"
                  ? "bg-white shadow-sm"
                  : "text-slate-400",
              )}
            >
              Live Tracking
            </button>
          </div>
          <Button
            onClick={() => {
              setEditingStaff(null);
              setIsModalOpen(true);
            }}
            className="btn-emerald h-10"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Staff
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search staff..."
                className="pl-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DataTable
              columns={columns}
              data={staff.filter((s) =>
                s.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
              )}
              isLoading={isLoading}
            />
          </motion.div>
        ) : (
          <motion.div
            key="tracking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[600px] bg-white rounded-2xl border relative overflow-hidden"
          >
            {selectedStaffId ? (
              <div className="h-full flex flex-col">
                <div className="p-4 bg-white border-b flex justify-between items-center z-[1000]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">
                        {staff.find((s) => s.id === selectedStaffId)?.full_name}
                      </h3>
                      <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
                        Live Tracking Active
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStaffId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 z-0">
                  {currentLocation ? (
                    <MapContainer
                      center={[currentLocation.lat, currentLocation.lng]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker
                        position={[currentLocation.lat, currentLocation.lng]}
                      >
                        <Popup>
                          {
                            staff.find((s) => s.id === selectedStaffId)
                              ?.full_name
                          }{" "}
                          is here.
                        </Popup>
                      </Marker>
                      <RecenterMap
                        lat={currentLocation.lat}
                        lng={currentLocation.lng}
                      />
                    </MapContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
                      <p className="text-slate-400 text-sm italic">
                        Waiting for GPS signal from staff device...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                  <MapPin className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium">No Staff Selected</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Select a staff member from the list view to see their live
                  location on the map.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveTab("list")}
                >
                  Go to List
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
      >
        <form className="p-6 space-y-6" onSubmit={handleSaveStaff}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name Input */}
            <div className="space-y-2">
              <Input
                label="Full Name"
                name="full_name"
                placeholder="e.g. John Doe"
                defaultValue={editingStaff?.full_name}
                required
                icon={<User className="h-4 w-4 text-slate-400" />}
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="john@example.com"
                defaultValue={editingStaff?.email}
                required
                icon={<Mail className="h-4 w-4 text-slate-400" />}
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <Input
                label="Phone Number"
                name="phone"
                placeholder="+1 234 567 890"
                defaultValue={editingStaff?.phone}
                required
                icon={<RefreshCw className="h-4 w-4 text-slate-400" />} // أو أيقونة هاتف لو متاحة
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Input
                label={
                  editingStaff
                    ? "New Password (Leave blank to keep current)"
                    : "Password"
                }
                name="password"
                type="password"
                placeholder="••••••••"
                required={!editingStaff}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-emerald px-8"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Staff Member"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffPage;
