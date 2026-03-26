import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, Package, X } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { apiEndpoints } from '../api/endpoints';
import { Service, StandardBag } from '../types';
import { formatCurrency } from '../lib/utils';
import { toast, Toaster } from 'sonner';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [bags, setBags] = useState<StandardBag[]>([]);
  const [isBagModalOpen, setIsBagModalOpen] = useState(false);
  const [editingBag, setEditingBag] = useState<StandardBag | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (editingService) {
      setBags(editingService.standard_bags || []);
    } else {
      setBags([]);
    }
  }, [editingService]);

  const fetchServices = async () => {
    try {
      const res = await apiEndpoints.getServices();
      setServices(res.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(s => 
    s.service_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await apiEndpoints.deleteService(id);
        setServices(services.filter(s => s.id !== id));
        toast.success('Service deleted successfully');
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const columns = [
    { header: 'Service Name', accessor: (s: Service) => (
      <div className="font-semibold text-carbon-black">{s.service_name}</div>
    )},
    { header: 'Base Price', accessor: (s: Service) => formatCurrency(s.price) },
    { header: 'Price Today', accessor: (s: Service) => (
      <div className="flex items-center gap-2">
        <span className="font-bold text-carbon-black">{formatCurrency(s.price_today)}</span>
        {s.discount > 0 && (
          <Badge variant="success">-{s.discount}%</Badge>
        )}
      </div>
    )},
    { header: 'Discount', accessor: (s: Service) => `${s.discount}%` },
    { header: 'Standard Bags', accessor: (s: Service) => (
      <div className="flex items-center gap-1 text-cool-gray">
        <Package className="h-4 w-4 text-carbon-black" />
        <span className="text-sm font-medium">{s.standard_bags?.length || 0}</span>
      </div>
    )},
    { 
      header: 'Actions', 
      accessor: (s: Service) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setEditingService(s); setIsModalOpen(true); }} className="text-carbon-black hover:bg-hover-highlight">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    },
  ];

  const handleSaveService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serviceData = {
      service_name: formData.get('service_name') as string,
      price: Number(formData.get('price')),
      price_today: Number(formData.get('price_today')),
      discount: Number(formData.get('discount')),
      standard_bags: bags,
    };

    try {
      if (editingService) {
        await apiEndpoints.updateService(editingService.id, serviceData);
        setServices(services.map(s => s.id === editingService.id ? { ...s, ...serviceData } : s));
        toast.success('Service updated successfully');
      } else {
        const res = await apiEndpoints.createService(serviceData);
        setServices([...services, res.data as Service]);
        toast.success('Service created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save service');
    }
  };

  const handleSaveBag = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bagData = {
      description: formData.get('bag_description') as string,
    };

    if (editingBag) {
      setBags(bags.map(b => b.id === editingBag.id ? { ...b, ...bagData } : b));
      toast.success('Bag updated');
    } else {
      const newBag: StandardBag = {
        ...bagData,
        id: Math.random(),
        service_id: editingService?.id || 0,
      };
      setBags([...bags, newBag]);
      toast.success('Bag added');
    }
    setIsBagModalOpen(false);
  };

  const handleDeleteBag = (id: number) => {
    setBags(bags.filter(b => b.id !== id));
    toast.success('Bag removed');
  };

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-carbon-black">Services</h1>
          <p className="text-text-description mt-1">Manage your service offerings and pricing.</p>
        </div>
        <Button onClick={() => { setEditingService(null); setIsModalOpen(true); }} className="btn-emerald">
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search services..." 
            className="pl-10 h-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-10 text-xs">
          <Filter className="mr-2 h-3.5 w-3.5" /> Filters
        </Button>
      </div>

      <DataTable columns={columns} data={filteredServices} isLoading={isLoading} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form className="p-6 space-y-8" onSubmit={handleSaveService}>
          <div className="space-y-5">
            <Input label="Service Name" name="service_name" defaultValue={editingService?.service_name} placeholder="e.g. Deep Cleaning" required />
            <div className="grid grid-cols-2 gap-5">
              <Input label="Base Price ($)" name="price" type="number" defaultValue={editingService?.price} placeholder="0.00" required />
              <Input label="Discount (%)" name="discount" type="number" defaultValue={editingService?.discount} placeholder="0" />
            </div>
            <Input label="Price Today ($)" name="price_today" type="number" defaultValue={editingService?.price_today} placeholder="0.00" required />
          </div>

          <div className="pt-6 border-t border-border-light">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-semibold text-carbon-black flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400" />
                  Standard Bags
                </h4>
                <p className="text-xs text-text-description mt-1">Define what's included in this service.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" className="text-xs h-8" onClick={() => { setEditingBag(null); setIsBagModalOpen(true); }}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Bag
              </Button>
            </div>
            
            <div className="space-y-3">
              {bags.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 bg-bg-surface rounded-xl border border-dashed border-border-light">
                  <Package className="h-6 w-6 text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400 italic">No standard bags added yet.</p>
                </div>
              ) : (
                bags.map(bag => (
                  <div key={bag.id} className="flex items-center justify-between p-4 rounded-xl bg-bg-surface border border-border-light group hover:bg-emerald-tint/50 transition-all">
                    <div className="flex-1">
                      <p className="text-sm text-text-description leading-relaxed line-clamp-2">{bag.description}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                      <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingBag(bag); setIsBagModalOpen(true); }} className="h-8 w-8 p-0 text-slate-400 hover:text-carbon-black hover:bg-white border border-transparent hover:border-border-light">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteBag(bag.id)} className="h-8 w-8 p-0 text-rose-400 hover:text-rose-600 hover:bg-rose-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border-light">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="text-xs">Cancel</Button>
            <Button type="submit" className="px-6 btn-emerald text-xs h-10">Save Service</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isBagModalOpen}
        onClose={() => setIsBagModalOpen(false)}
        title={editingBag ? 'Edit Standard Bag' : 'Add Standard Bag'}
      >
        <form className="p-6 space-y-6" onSubmit={handleSaveBag}>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Description</label>
            <textarea 
              name="bag_description" 
              defaultValue={editingBag?.description} 
              rows={4}
              className="flex w-full rounded-lg border border-border-thin bg-white px-4 py-3 text-sm text-carbon-gray placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-solid/10 focus:border-emerald-solid transition-all outline-none"
              placeholder="What's in the bag?"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-border-light">
            <Button variant="ghost" type="button" onClick={() => setIsBagModalOpen(false)} className="text-xs">Cancel</Button>
            <Button type="submit" className="px-6 btn-emerald text-xs h-10">{editingBag ? 'Update Bag' : 'Add Bag'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Services;
