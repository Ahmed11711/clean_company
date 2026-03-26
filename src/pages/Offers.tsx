import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Image as ImageIcon, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Eye,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Offer } from '../types';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const mockOffers: Offer[] = [
  {
    id: 1,
    title: "50% Off Spring Cleaning",
    description: "Get your home ready for spring with our deep cleaning package at half the price.",
    image_path: "https://picsum.photos/seed/spring/800/400",
    category_id: 1,
    category_name: "Cleaning",
    is_active: true,
    company_id: 1,
  },
  {
    id: 2,
    title: "Free Standard Bag with First Order",
    description: "New customers get a free laundry bag with their first service booking.",
    image_path: "https://picsum.photos/seed/laundry/800/400",
    category_id: 2,
    category_name: "Laundry",
    is_active: true,
    company_id: 1,
  },
  {
    id: 3,
    title: "Weekend Garden Special",
    description: "Book any garden maintenance for the weekend and get a 20% discount.",
    image_path: "https://picsum.photos/seed/garden/800/400",
    category_id: 3,
    category_name: "Maintenance",
    is_active: false,
    company_id: 1,
  },
];

const categories = [
  { id: 1, name: 'Cleaning' },
  { id: 2, name: 'Laundry' },
  { id: 3, name: 'Maintenance' },
  { id: 4, name: 'Pool' },
];

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleActive = (id: number) => {
    setOffers(prev => prev.map(offer => 
      offer.id === id ? { ...offer, is_active: !offer.is_active } : offer
    ));
    const offer = offers.find(o => o.id === id);
    toast.success(`Offer ${offer?.is_active ? 'deactivated' : 'activated'} successfully`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const categoryId = Number(formData.get('category_id'));
    const category = categories.find(c => c.id === categoryId);

    const newOffer: Offer = {
      id: offers.length + 1,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      image_path: imagePreview || "https://picsum.photos/seed/new/800/400",
      category_id: categoryId,
      category_name: category?.name || 'General',
      is_active: true,
      company_id: 1,
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOffers([newOffer, ...offers]);
      setIsModalOpen(false);
      setImagePreview(null);
      toast.success('Offer published successfully!');
    } catch (error) {
      toast.error('Failed to publish offer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-carbon-black">Offers & Promotions</h1>
          <p className="text-text-description mt-1">Create and manage promotional banners for your customers.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="btn-emerald h-10 text-xs px-6">
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
              className="group relative overflow-hidden rounded-xl border border-border-light bg-white shadow-sm transition-all hover:shadow-md hover:bg-emerald-tint/10"
            >
              <div className="aspect-[2/1] overflow-hidden bg-bg-surface border-b border-border-light">
                <img 
                  src={offer.image_path} 
                  alt={offer.title} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="info" className="bg-white/90 backdrop-blur-sm text-[10px]">
                    {offer.category_name}
                  </Badge>
                </div>
                {offer.is_active && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="success" className="bg-white/90 backdrop-blur-sm text-[10px]">
                      Active
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-carbon-black line-clamp-1">{offer.title}</h3>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleToggleActive(offer.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-solid/10 ${
                        offer.is_active ? 'bg-emerald-solid' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                          offer.is_active ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-text-description leading-relaxed line-clamp-2">{offer.description}</p>
                
                <div className="mt-6 flex items-center justify-between border-t border-border-light pt-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Eye className="h-3.5 w-3.5" />
                    <span>1.2k views</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-400 hover:text-rose-600 hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-carbon-black hover:bg-white border border-transparent hover:border-border-light">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-10">
          <div className="space-y-8">
            <div className="border-b border-border-light pb-4">
              <h3 className="text-lg font-semibold text-carbon-black">Promotion Details</h3>
              <p className="text-xs text-text-description mt-1">Provide a catchy description for your customers</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Banner Image</label>
                <div className="relative">
                  <div 
                    className={`flex aspect-[2/1] flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                      imagePreview ? 'border-emerald-solid bg-bg-surface' : 'border-border-light hover:border-emerald-solid hover:bg-emerald-tint/20'
                    }`}
                  >
                    {imagePreview ? (
                      <div className="relative h-full w-full p-2">
                        <img src={imagePreview} alt="Preview" className="h-full w-full rounded-lg object-cover" />
                        <button 
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="absolute top-4 right-4 rounded-full bg-white/90 p-2 text-rose-600 shadow-xl hover:bg-white transition-transform hover:scale-110"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center p-8 text-center">
                        <div className="mb-4 rounded-xl bg-bg-surface p-3 border border-border-light">
                          <Upload className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-xs font-semibold text-carbon-black">Click or drag to upload</p>
                        <p className="mt-1 text-[10px] text-slate-400 font-medium">Recommended size: 1200x600px (Max 2MB)</p>
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

              <Input 
                label="Offer Title" 
                name="title" 
                placeholder="e.g. 50% Off Spring Cleaning" 
                required 
                icon={<Tag className="h-4 w-4" />}
              />

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Offer Description</label>
                <textarea 
                  name="description" 
                  required
                  rows={3}
                  className="flex w-full rounded-lg border border-border-thin bg-white px-4 py-3 text-sm text-carbon-gray placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-solid/10 focus:border-emerald-solid transition-all outline-none"
                  placeholder="Explain the benefits of this offer..."
                />
                <p className="text-[10px] text-slate-400 font-medium">Provide a catchy description for your customers</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="border-b border-border-light pb-4">
              <h3 className="text-lg font-semibold text-carbon-black">Targeting & Category</h3>
              <p className="text-xs text-text-description mt-1">Select where this offer should be displayed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Service Category</label>
                <select 
                  name="category_id"
                  required
                  className="flex w-full rounded-lg border border-border-thin bg-white px-4 py-2.5 text-sm text-carbon-gray focus:outline-none focus:ring-2 focus:ring-emerald-solid/10 focus:border-emerald-solid transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem_1rem] bg-[right_0.75rem_center] bg-no-repeat"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <Input 
                label="Company ID" 
                name="company_id" 
                defaultValue="1" 
                readOnly 
                className="bg-bg-surface"
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-8 border-t border-border-light">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs">Cancel</Button>
            <Button type="submit" className="min-w-[160px] px-8 btn-emerald text-xs h-10" isLoading={isLoading}>
              Publish Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Offers;
