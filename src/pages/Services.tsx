import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Package, ImageIcon, Users } from "lucide-react";
import { DataTable } from "../components/DataTable";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { serviceApi } from "../services/serviceApi";
import { Service } from "../types";
import { formatCurrency } from "../lib/utils";
import { toast, Toaster } from "sonner";

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await serviceApi.getServices();
      setServices(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter((s) =>
    s.service_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await serviceApi.deleteService(id);
        setServices(services.filter((s) => s.id !== id));
        toast.success("Service deleted successfully");
      } catch (error) {
        toast.error("Failed to delete service");
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOpenModal = (service: Service | null) => {
    setEditingService(service);
    setSelectedImage(null);
    setImagePreview(service?.image || null);
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const serviceData = {
      service_name: formData.get("service_name") as string,
      service_name_ar: formData.get("service_name_ar") as string,
      price: Number(formData.get("price")),
      price_today: Number(formData.get("price_today")),
      discount: Number(formData.get("discount")),
      standard_bags: formData.get("standard_bags") as string,
      standard_bags_ar: formData.get("standard_bags_ar") as string,
      max_staff: formData.get("max_staff") ? formData.get("max_staff") : null,
      price_staff: formData.get("price_staff")
        ? formData.get("price_staff")
        : null,
    };

    setIsSaving(true);
    try {
      if (editingService) {
        const res = await serviceApi.updateService(
          editingService.id,
          serviceData,
          selectedImage,
        );
        setServices(
          services.map((s) => (s.id === editingService.id ? res.data : s)),
        );
        toast.success("Service updated successfully");
      } else {
        const res = await serviceApi.createService(serviceData, selectedImage);
        setServices([res.data, ...services]);
        toast.success("Service created successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save service");
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: "Service",
      accessor: (s: Service) => (
        <div className="flex items-center gap-3">
          {s.image ? (
            <img
              src={s.image}
              alt={s.service_name}
              className="h-10 w-10 rounded-lg object-cover border border-border-light"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-bg-surface border border-border-light flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-slate-300" />
            </div>
          )}
          <div>
            <div className="font-semibold text-carbon-black">
              {s.service_name}
            </div>
            {s.service_name_ar && (
              <div className="text-xs text-slate-400 text-right" dir="rtl">
                {s.service_name_ar}
              </div>
            )}
          </div>
        </div>
      ),
    },
    { header: "Base Price", accessor: (s: Service) => formatCurrency(s.price) },
    {
      header: "Price Today",
      accessor: (s: Service) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-carbon-black">
            {formatCurrency(s.price_today)}
          </span>
          {Number(s.discount) > 0 && (
            <Badge variant="success">-{s.discount}%</Badge>
          )}
        </div>
      ),
    },
    {
      header: "Staff",
      accessor: (s: Service) => (
        <div className="flex items-center gap-1 text-sm text-cool-gray">
          <Users className="h-3.5 w-3.5" />
          <span>{s.max_staff ?? "—"}</span>
          {s.price_staff && (
            <span className="text-xs text-slate-400 ml-1">
              ({formatCurrency(s.price_staff)}/staff)
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Standard Bags",
      accessor: (s: Service) => (
        <div
          className="text-sm text-cool-gray max-w-[200px] truncate"
          title={s.standard_bags}
        >
          {s.standard_bags || "No description"}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (s: Service) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(s)}>
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

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-carbon-black">Services</h1>
        <Button onClick={() => handleOpenModal(null)} className="btn-emerald">
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredServices}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? "Edit Service" : "Add New Service"}
      >
        <form className="p-6 space-y-6" onSubmit={handleSaveService}>
          <div className="space-y-5">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Service Image
              </label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-border-light bg-bg-surface flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <ImageIcon className="h-7 w-7 text-slate-300" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="service-image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="service-image-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-light bg-white text-sm font-medium text-carbon-black hover:bg-bg-surface transition-colors"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedImage(null);
                      }}
                      className="ml-2 text-xs text-rose-400 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Service Name EN + AR */}
            <div className="grid grid-cols-2 gap-5">
              <Input
                label="Service Name"
                name="service_name"
                defaultValue={editingService?.service_name}
                placeholder="e.g. Dry Cleaning"
                required
              />
              <Input
                label="اسم الخدمة (عربي)"
                name="service_name_ar"
                defaultValue={editingService?.service_name_ar}
                dir="rtl"
                placeholder="مثال: التنظيف الجاف"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-5">
              <Input
                label="Base Price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={editingService?.price}
                required
              />
              <Input
                label="Discount (%)"
                name="discount"
                type="number"
                defaultValue={editingService?.discount || 0}
              />
            </div>

            <Input
              label="Price Today"
              name="price_today"
              type="number"
              step="0.01"
              defaultValue={editingService?.price_today}
              required
            />

            {/* Staff Settings */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-sm font-semibold text-carbon-black flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                Staff Settings
              </label>
              <div className="grid grid-cols-2 gap-5">
                <Input
                  label="Max Staff"
                  name="max_staff"
                  type="number"
                  defaultValue={editingService?.max_staff ?? ""}
                  placeholder="e.g. 3"
                />
                <Input
                  label="Price per Staff ($)"
                  name="price_staff"
                  type="number"
                  step="0.01"
                  defaultValue={editingService?.price_staff ?? ""}
                  placeholder="e.g. 10.00"
                />
              </div>
            </div>

            {/* Standard Bags EN + AR */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-sm font-semibold text-carbon-black flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-400" />
                Standard Bags Description
              </label>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    English
                  </label>
                  <textarea
                    name="standard_bags"
                    defaultValue={editingService?.standard_bags}
                    placeholder="e.g. 5kg bag, dry clean only..."
                    rows={4}
                    className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all border-slate-200 hover:border-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    عربي
                  </label>
                  <textarea
                    name="standard_bags_ar"
                    defaultValue={editingService?.standard_bags_ar}
                    placeholder="مثال: كيس 5 كجم، تنظيف جاف فقط..."
                    rows={4}
                    dir="rtl"
                    className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all border-slate-200 hover:border-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="ghost"
              type="button"
              disabled={isSaving}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-emerald px-8"
              isLoading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Service"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Services;
