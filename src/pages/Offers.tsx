import React, { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  X,
  CheckCircle2,
  Upload,
  Eye,
  Trash2,
  MoreVertical,
  Loader2,
  Languages,
} from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { Offer } from "../types";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { offerApi } from "../services/offersServcie";

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [offersRes, catsRes] = await Promise.all([
        offerApi.getOffers(),
        offerApi.getCategories(),
      ]);
      setOffers(offersRes.data || offersRes);
      setCategories(catsRes.data || catsRes);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. معالجة اختيار الصورة
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. إرسال العرض الجديد (يدعم العربية والإنجليزية)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const response = await offerApi.createOffer(formData);
      const newOffer = response.data || response;

      setOffers([newOffer, ...offers]);
      setIsModalOpen(false);
      resetForm();
      form.reset();
      toast.success("Offer published successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to publish offer");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleToggleActive = async (id: number) => {
    try {
      await offerApi.toggleStatus(id);
      setOffers((prev) =>
        prev.map((offer) =>
          offer.id === id ? { ...offer, is_active: !offer.is_active } : offer,
        ),
      );
      toast.success(`Status updated successfully`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      await offerApi.deleteOffer(id);
      setOffers((prev) => prev.filter((o) => o.id !== id));
      toast.success("Offer deleted");
    } catch (error) {
      toast.error("Failed to delete offer");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Toaster position="top-right" richColors />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-carbon-black font-arabic">
            Offers
          </h1>
          <p className="text-text-description mt-1">
            Manage your promotional banners in both English and Arabic.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="btn-emerald h-10 text-xs px-6"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Offer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {offers.map((offer) => (
            <motion.div
              key={offer.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative overflow-hidden rounded-xl border border-border-light bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-[2/1] overflow-hidden bg-bg-surface border-b border-border-light">
                <img
                  src={offer.image_path}
                  alt={offer.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="info"
                    className="bg-white/90 backdrop-blur-sm text-[10px]"
                  >
                    {offer.category_name || "General"}
                  </Badge>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-carbon-black line-clamp-1">
                      {offer.title}
                    </h3>
                    <p
                      className="text-[11px] text-slate-400 font-medium mt-0.5"
                      dir="rtl"
                    >
                      {offer.title_ar}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(offer.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      offer.is_active ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        offer.is_active ? "translate-x-4.5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border-light pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Eye className="h-3.5 w-3.5" />
                    <span>Live View</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(offer.id)}
                      className="h-8 w-8 p-0 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Promotion"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Banner Image
              </label>
              <div className="relative">
                <div
                  className={`flex aspect-[2.5/1] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                    imagePreview
                      ? "border-emerald-500 bg-bg-surface"
                      : "border-border-light hover:border-emerald-500"
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative h-full w-full p-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={resetForm}
                        className="absolute top-4 right-4 rounded-full bg-white/90 p-2 text-rose-600 shadow-xl"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-6 text-center">
                      <Upload className="h-6 w-6 text-slate-300 mb-2" />
                      <p className="text-xs font-semibold text-carbon-black">
                        Click to upload banner
                      </p>
                      <input
                        type="file"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Titles EN & AR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Offer Title (EN)"
                name="title"
                placeholder="e.g. 50% Off"
                required
                icon={<Tag className="h-4 w-4" />}
              />
              <Input
                label="عنوان العرض (عربي)"
                name="title_ar"
                placeholder="مثال: خصم 50%"
                required
                dir="rtl"
                icon={<Languages className="h-4 w-4" />}
              />
            </div>

            {/* Descriptions EN & AR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Description (EN)
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="flex w-full rounded-lg border border-border-thin bg-white px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                  placeholder="Details in English..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  الوصف (عربي)
                </label>
                <textarea
                  name="description_ar"
                  required
                  rows={3}
                  dir="rtl"
                  className="flex w-full rounded-lg border border-border-thin bg-white px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all"
                  placeholder="تفاصيل العرض بالعربي..."
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Service Category
                </label>
                <select
                  name="category_id"
                  required
                  className="w-full rounded-lg border border-border-thin bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </label>
                <div className="flex items-center h-10 px-4 bg-slate-50 rounded-lg text-xs font-medium text-slate-500 border border-border-thin">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                  Linked to your company
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border-light">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-[160px] btn-emerald"
              isLoading={isSaving}
            >
              Publish Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Offers;
