import React, { useEffect, useState } from 'react';
import { Camera, CheckCircle2, MapPin, DollarSign, ShieldCheck, Star } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { apiEndpoints } from '../api/endpoints';
import { CompanyProfile } from '../types';
import { toast, Toaster } from 'sonner';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiEndpoints.getProfile();
      setProfile(res.data);
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully');
      setIsChangingPassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    
    const updatedProfile: CompanyProfile = {
      ...profile,
      name: formData.get('name') as string,
      hourly_rate: Number(formData.get('hourly_rate')),
      address: formData.get('address') as string,
      description: formData.get('description') as string,
      free_delivery: formData.get('free_delivery') === 'on',
    };

    try {
      // In a real app, we would call an API here
      // await apiEndpoints.updateProfile(updatedProfile);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, logo: reader.result as string });
        toast.success('Logo updated successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <div className="animate-pulse space-y-10">
    <div className="h-48 w-full rounded-xl bg-bg-surface border border-border-light" />
    <div className="grid grid-cols-2 gap-8">
      <div className="h-12 rounded-lg bg-bg-surface border border-border-light" />
      <div className="h-12 rounded-lg bg-bg-surface border border-border-light" />
    </div>
  </div>;

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-carbon-black">Company Profile</h1>
        <p className="text-text-description mt-1">Manage your business identity and settings.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
          <div className="rounded-xl border border-border-light bg-white p-6 shadow-sm text-center group hover:bg-emerald-tint/5 transition-all">
            <div className="relative mx-auto h-32 w-32">
              <img 
                src={profile?.logo} 
                alt="Logo" 
                className="h-full w-full rounded-xl object-cover border-4 border-bg-surface shadow-sm" 
              />
              <input 
                type="file" 
                id="logo-upload" 
                className="hidden" 
                accept="image/*" 
                onChange={handleLogoUpload} 
              />
              <label 
                htmlFor="logo-upload" 
                className="absolute -bottom-2 -right-2 rounded-full bg-white p-2 shadow-lg border border-border-light hover:bg-bg-surface text-carbon-black cursor-pointer transition-all hover:scale-110"
              >
                <Camera className="h-4 w-4" />
              </label>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-carbon-black flex items-center justify-center gap-2">
                {profile?.name}
                {profile?.is_verified && <ShieldCheck className="h-5 w-5 text-emerald-solid" />}
              </h3>
              <p className="text-xs text-text-description mt-1">{profile?.address}</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-carbon-black">{profile?.rating}</span>
                <span className="text-[10px] text-slate-400 font-medium">(45 reviews)</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border-light flex justify-around">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hourly Rate</p>
                <p className="text-base font-semibold text-carbon-black">${profile?.hourly_rate}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                <p className="text-base font-semibold text-emerald-text">Active</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border-light bg-white p-6 shadow-sm">
            <h4 className="font-bold text-slate-400 mb-4 uppercase tracking-widest text-[10px]">Verification Status</h4>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-emerald-tint p-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-solid" />
              </div>
              <div>
                <p className="text-sm font-semibold text-carbon-black">Identity Verified</p>
                <p className="text-xs text-text-description">Your business identity has been confirmed.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-xl border border-border-light bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-carbon-black mb-8">Business Information</h3>
            <form className="space-y-8" onSubmit={handleUpdateProfile}>
              <div className="grid gap-8 sm:grid-cols-2">
                <Input label="Company Name" name="name" defaultValue={profile?.name} />
                <Input label="Hourly Rate ($)" name="hourly_rate" type="number" defaultValue={profile?.hourly_rate} />
              </div>
              <Input label="Business Address" name="address" defaultValue={profile?.address} />
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Business Description</label>
                <textarea 
                  name="description" 
                  defaultValue={profile?.description} 
                  rows={4}
                  className="flex w-full rounded-lg border border-border-thin bg-white px-4 py-3 text-sm text-carbon-gray placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-solid/10 focus:border-emerald-solid transition-all outline-none"
                  placeholder="Describe your company services..."
                />
              </div>

              <div className="flex items-center justify-between p-6 rounded-xl bg-bg-surface border border-border-light">
                <div>
                  <p className="text-sm font-semibold text-carbon-black">Free Delivery</p>
                  <p className="text-xs text-text-description mt-1">Enable this to offer free delivery for your services.</p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="free_delivery" 
                    id="free_delivery"
                    defaultChecked={profile?.free_delivery}
                    className="h-5 w-10 appearance-none rounded-full bg-slate-200 transition-colors checked:bg-emerald-solid relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5 shadow-inner"
                  />
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <Input label="Contact Email" name="email" defaultValue="contact@homeservices.com" disabled />
                <Input label="Phone Number" name="phone" defaultValue="+1 (555) 000-0000" disabled />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="btn-emerald h-11 px-8 text-xs" isLoading={isUpdating}>Save Profile Changes</Button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-border-light bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-carbon-black mb-8">Security Settings</h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-carbon-black">Change Password</p>
                    <p className="text-xs text-text-description">Update your account password regularly.</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className={`text-xs h-9 px-4 border ${isChangingPassword ? 'border-border-light bg-bg-surface' : 'border-emerald-solid/20 text-emerald-text hover:bg-emerald-tint/20'}`}
                  >
                    {isChangingPassword ? "Cancel" : "Update"}
                  </Button>
                </div>

                {isChangingPassword && (
                  <form onSubmit={handleUpdatePassword} className="mt-4 space-y-6 pt-8 border-t border-border-light">
                    <div className="grid gap-6 sm:grid-cols-3">
                      <Input 
                        label="Current Password" 
                        type="password" 
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        required
                      />
                      <Input 
                        label="New Password" 
                        type="password" 
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        required
                      />
                      <Input 
                        label="Confirm New Password" 
                        type="password" 
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" className="btn-emerald h-10 px-6 text-xs" isLoading={isUpdating}>
                        Update Password
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
