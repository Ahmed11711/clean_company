import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ImageIcon,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { serviceApi } from "../services/serviceApi";
import { Service, ServiceItem } from "../types";
import { formatCurrency } from "../lib/utils";
import { toast, Toaster } from "sonner";
import { cn } from "../lib/utils";

const ServiceItems: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) fetchItems(selectedService.id);
  }, [selectedService]);

  const fetchServices = async () => {
    setIsLoadingServices(true);
    try {
      const res = await serviceApi.getServices();
      const fetched = res.data || [];
      setServices(fetched);
      if (fetched.length > 0) setSelectedService(fetched[0]);
    } catch {
      toast.error("Failed to fetch services");
    } finally {
      setIsLoadingServices(false);
    }
  };

  const fetchItems = async (serviceId: number) => {
    setIsLoadingItems(true);
    try {
      const res = await serviceApi.getServiceItems(serviceId);
      setItems(res.data || []);
    } catch {
      toast.error("Failed to fetch items");
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleOpenModal = (item: ServiceItem | null) => {
    setEditingItem(item);
    setSelectedImage(null);
    setImagePreview(item?.image || null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedService) return;

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    // 1. استخراج القيم من الفورم يدوياً لبناء كائن الـ data (إذا كان الـ API يطلبه كـ Object)
    const data = {
      name: formData.get("name") as string,
      name_ar: formData.get("name_ar") as string,
      description: formData.get("description") as string,
      description_ar: formData.get("description_ar") as string,
      price: Number(formData.get("price")),
      service_id: selectedService.id, // ربط العنصر بالخدمة المختارة
    };

    setIsSaving(true);
    try {
      if (editingItem) {
        const res = await serviceApi.updateServiceItem(
          editingItem.id,
          { ...data, id: editingItem.id }, // دمج الـ id مع البيانات
          selectedImage,
        );
        setItems(items.map((i) => (i.id === editingItem.id ? res.data : i)));
        toast.success("Item updated successfully");
      } else {
        // 3. في حالة الإضافة
        const res = await serviceApi.createServiceItem(data, selectedImage);
        setItems([...items, res.data]);
        toast.success("Item added successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await serviceApi.deleteServiceItem(id);
      setItems(items.filter((i) => i.id !== id));
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-carbon-black">
            Service Items
          </h1>
          <p className="text-text-description mt-1 text-sm">
            Manage treatments and care options shown to customers in the app.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal(null)}
          className="btn-emerald"
          disabled={!selectedService}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar — Services */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border-light bg-white p-4 shadow-sm">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
              Select Service
            </h3>
            {isLoadingServices ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 rounded-lg bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all",
                      selectedService?.id === service.id
                        ? "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-carbon-black",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.service_name}
                          className="h-6 w-6 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-md bg-slate-100 flex-shrink-0" />
                      )}
                      <span className="truncate">{service.service_name}</span>
                    </div>
                    {selectedService?.id === service.id && (
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main — Items */}
        <div className="lg:col-span-3">
          {/* Selected Service Header */}
          {selectedService && (
            <div className="mb-5 flex items-center gap-3 px-1">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold text-carbon-black">
                Care for your{" "}
                <span className="text-emerald-600">
                  {selectedService.service_name}
                </span>
              </span>
              <span className="ml-auto text-[11px] text-slate-400">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
          )}

          {isLoadingItems ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-slate-100 animate-pulse border border-border-light"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-light bg-white py-20 text-center">
              <Sparkles className="h-8 w-8 text-slate-200 mb-3" />
              <p className="text-sm font-semibold text-slate-400">
                No items yet
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Add your first care option for this service
              </p>
              <Button
                onClick={() => handleOpenModal(null)}
                className="btn-emerald mt-6 text-xs"
                size="sm"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-4 rounded-xl border border-border-light bg-white p-4 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Image */}
                  <div className="h-14 w-14 rounded-xl overflow-hidden border border-border-light flex-shrink-0 bg-bg-surface flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-carbon-black truncate">
                        {item.name}
                      </p>
                      {item.name_ar && (
                        <p className="text-xs text-slate-400" dir="rtl">
                          {item.name_ar}
                        </p>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-carbon-black">
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-[10px] text-slate-400">per pc</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Item" : "Add New Item"}
      >
        <form className="p-6 space-y-5" onSubmit={handleSave}>
          {/* Image */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Item Image
            </label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl border-2 border-dashed border-border-light bg-bg-surface flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="item-image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="item-image-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-light bg-white text-xs font-medium text-carbon-black hover:bg-bg-surface transition-colors"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  {imagePreview ? "Change" : "Upload"}
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
              </div>
            </div>
          </div>

          {/* Name EN + AR */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Item Name"
              name="name"
              defaultValue={editingItem?.name}
              placeholder="e.g. Dry Clean"
              required
            />
            <Input
              label="الاسم (عربي)"
              name="name_ar"
              defaultValue={editingItem?.name_ar}
              dir="rtl"
              placeholder="مثال: تنظيف جاف"
            />
          </div>

          {/* Price */}
          <Input
            label="Price ($)"
            name="price"
            type="number"
            step="0.01"
            defaultValue={editingItem?.price}
            placeholder="e.g. 8.50"
            required
          />

          {/* Description EN + AR */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={editingItem?.description}
                placeholder="e.g. Chemical-free deep treatment"
                rows={3}
                className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all border-slate-200 hover:border-slate-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                الوصف (عربي)
              </label>
              <textarea
                name="description_ar"
                defaultValue={editingItem?.description_ar}
                placeholder="مثال: تنظيف عميق خالي من المواد الكيميائية"
                rows={3}
                dir="rtl"
                className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all border-slate-200 hover:border-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
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
              {isSaving ? "Saving..." : "Save Item"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServiceItems;
