import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  RefreshCw,
  Loader2,
  Map as MapIcon,
  Navigation,
  Activity
} from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { apiEndpoints } from '../api/endpoints';
import { Staff } from '../types';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'tracking'>('list');

  // Mock live locations
  const staffLocations = staff.map((s, i) => ({
    ...s,
    lat: 30.0444 + (Math.random() - 0.5) * 0.1,
    lng: 31.2357 + (Math.random() - 0.5) * 0.1,
    status: i % 2 === 0 ? 'active' : 'idle'
  }));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const staffRes = await apiEndpoints.getStaff();
      setStaff(staffRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    toast.success('Password generated successfully');
  };

  const handleSaveStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);

    const staffData: Omit<Staff, 'id'> = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      password: (formData.get('password') as string) || undefined,
    };

    try {
      if (editingStaff) {
        await apiEndpoints.updateStaff(editingStaff.id, staffData);
        setStaff(staff.map(s => s.id === editingStaff.id ? { ...s, ...staffData } : s));
        toast.success('Staff updated successfully');
      } else {
        const res = await apiEndpoints.createStaff(staffData);
        setStaff([...staff, res.data as Staff]);
        toast.success('Staff added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save staff');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        await apiEndpoints.deleteStaff(id);
        setStaff(staff.filter(s => s.id !== id));
        toast.success('Staff member removed');
      } catch (error) {
        toast.error('Failed to delete staff');
      }
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    { 
      header: 'Staff Member', 
      accessor: (s: Staff) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-bg-surface flex items-center justify-center border border-border-thin group-hover:bg-white transition-colors">
            <User className="h-6 w-6 text-carbon-black" />
          </div>
          <div>
            <div className="font-bold text-carbon-black">{s.full_name}</div>
            <div className="text-xs text-cool-gray mt-0.5">{s.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Phone', 
      accessor: (s: Staff) => (
        <span className="text-sm font-medium text-cool-gray">{s.phone}</span>
      )
    },
    { 
      header: 'Actions', 
      accessor: (s: Staff) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setEditingStaff(s); setGeneratedPassword(''); setIsModalOpen(true); }} 
            className="text-carbon-black hover:bg-hover-highlight"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDelete(s.id)} 
            className="text-rose-500 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'text-right'
    },
  ];

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />
      
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-carbon-black">Staff Management</h1>
          <p className="text-text-description mt-1">Manage your service providers and their professional profiles.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-bg-surface p-1 rounded-lg border border-border-light">
            <button 
              onClick={() => setActiveTab('list')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
                activeTab === 'list' ? "bg-white text-carbon-black shadow-sm border border-border-light" : "text-slate-400 hover:text-carbon-black"
              )}
            >
              List View
            </button>
            <button 
              onClick={() => setActiveTab('tracking')}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all",
                activeTab === 'tracking' ? "bg-white text-carbon-black shadow-sm border border-border-light" : "text-slate-400 hover:text-carbon-black"
              )}
            >
              Live Tracking
            </button>
          </div>
          <Button onClick={() => { setEditingStaff(null); setGeneratedPassword(''); setIsModalOpen(true); }} className="btn-emerald h-10 text-xs px-6">
            <Plus className="mr-2 h-4 w-4" /> Add New Staff
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Search by name or email..." 
                  className="pl-12 h-12 text-sm" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <DataTable columns={columns} data={filteredStaff} isLoading={isLoading} />
          </motion.div>
        ) : (
          <motion.div 
            key="tracking"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl border border-border-light p-5 shadow-sm">
                  <h3 className="text-[11px] font-bold text-carbon-black uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-emerald-solid" /> Active Staff
                  </h3>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    {staffLocations.map(s => (
                      <div key={s.id} className="p-3 rounded-lg border border-border-light hover:bg-emerald-tint/50 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            s.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-200"
                          )} />
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-carbon-black">{s.full_name}</div>
                            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
                              {s.status === 'active' ? 'On Journey' : 'Idle'}
                            </div>
                          </div>
                          <Navigation className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="relative h-[700px] rounded-xl bg-bg-surface border border-border-light overflow-hidden shadow-inner">
                  {/* Mock Map Background - Grayscale/Silver theme */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#111827 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                  </div>
                  
                  {/* Map Controls */}
                  <div className="absolute top-6 right-6 flex flex-col gap-3 z-10">
                    <div className="bg-white p-1.5 rounded-lg shadow-xl border border-border-light flex flex-col gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-carbon-black hover:bg-slate-100">+</Button>
                      <div className="h-px bg-border-light mx-1" />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-carbon-black hover:bg-slate-100">-</Button>
                    </div>
                    <Button variant="outline" size="sm" className="bg-white shadow-xl border-border-light text-carbon-black hover:bg-slate-50 h-10 px-4 rounded-lg font-semibold text-xs">
                      <MapIcon className="h-4 w-4 mr-2" /> Center Map
                    </Button>
                  </div>

                  {/* Staff Markers - Emerald theme */}
                  {staffLocations.map(s => (
                    <motion.div
                      key={s.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute cursor-pointer group"
                      style={{ 
                        left: `${((s.lng - 31.1) / 0.2) * 100}%`, 
                        top: `${((s.lat - 29.9) / 0.2) * 100}%` 
                      }}
                    >
                      <div className="relative">
                        <div className={cn(
                          "h-10 w-10 rounded-lg bg-white border-2 shadow-2xl flex items-center justify-center transition-all group-hover:scale-110",
                          s.status === 'active' ? "border-emerald-solid" : "border-slate-200"
                        )}>
                          <User className={cn("h-5 w-5", s.status === 'active' ? "text-emerald-solid" : "text-slate-300")} />
                        </div>
                        {s.status === 'active' && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-[3px] border-white animate-pulse shadow-lg" />
                        )}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          <div className="bg-carbon-black text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-2xl">
                            {s.full_name}
                          </div>
                          <div className="w-2 h-2 bg-carbon-black rotate-45 mx-auto -mt-1" />
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Legend */}
                  <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-border-light shadow-2xl">
                    <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2.5">
                        <div className="h-3 w-3 rounded-full bg-emerald-solid shadow-[0_0_10px_rgba(0,158,96,0.4)]" />
                        <span className="text-carbon-black">On Journey</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-3 w-3 rounded-full bg-slate-200" />
                        <span className="text-slate-400">Idle</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
      >
        <form className="p-6 space-y-10" onSubmit={handleSaveStaff}>
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <div className="border-b border-border-light pb-4">
              <h3 className="text-lg font-semibold text-carbon-black">Personal Information</h3>
              <p className="text-xs text-text-description mt-1">Enter the staff member's official contact details.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Full Name" 
                name="full_name" 
                defaultValue={editingStaff?.full_name} 
                placeholder="e.g. Ahmed Samir" 
                required 
                icon={<User className="h-4 w-4" />}
              />
              <Input 
                label="Phone Number" 
                name="phone" 
                defaultValue={editingStaff?.phone} 
                placeholder="+20 123 456 789" 
                required 
                icon={<Phone className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Section 4: Account Credentials */}
          <div className="space-y-6">
            <div className="border-b border-border-light pb-4">
              <h3 className="text-lg font-semibold text-carbon-black">Account Credentials</h3>
              <p className="text-xs text-text-description mt-1">
                {editingStaff ? 'Update their email or reset their password.' : 'Set their initial login credentials.'}
              </p>
            </div>
            <div className="space-y-6">
              <Input 
                label="Login Email" 
                name="email" 
                type="email"
                defaultValue={editingStaff?.email} 
                placeholder="ahmed@company.com" 
                required 
                icon={<Mail className="h-4 w-4" />}
              />
              <div className="flex items-end gap-6">
                <div className="flex-1 relative">
                  <Input 
                    label="Password"
                    name="password"
                    value={generatedPassword} 
                    onChange={(e) => setGeneratedPassword(e.target.value)}
                    placeholder={editingStaff ? 'Leave blank to keep current...' : 'Enter or generate password...'} 
                    className="pr-12 font-mono text-carbon-black bg-bg-surface border-border-light"
                    icon={<RefreshCw className="h-4 w-4" />}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={generatePassword}
                    className="absolute right-1.5 bottom-1.5 h-9 w-9 p-0 text-slate-400 hover:text-carbon-black hover:bg-white border border-transparent hover:border-border-light"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 max-w-[180px] mb-3 leading-relaxed">
                  {editingStaff ? 'New password will replace the old one.' : 'Copy this password and send it to the staff member.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-border-light">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="text-xs">Cancel</Button>
            <Button type="submit" disabled={isSaving} className="min-w-[140px] px-8 btn-emerald text-xs h-10">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Staff'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffPage;
