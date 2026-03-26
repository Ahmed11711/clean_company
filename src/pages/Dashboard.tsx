import React, { useEffect, useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { apiEndpoints } from '../api/endpoints';
import { Booking, DashboardStats } from '../types';
import { formatCurrency } from '../lib/utils';
import { Badge } from '../components/Badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const chartData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const role = localStorage.getItem('role') || 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          apiEndpoints.getStats(),
          apiEndpoints.getBookings(),
        ]);
        setStats(statsRes.data);
        setRecentBookings(bookingsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { 
      header: 'Customer', 
      accessor: (b: Booking) => (
        <span className="font-semibold text-carbon-black">{b.user_name}</span>
      ) 
    },
    { header: 'Service', accessor: (b: Booking) => b.service_name },
    { header: 'Date', accessor: (b: Booking) => b.booking_date },
    { 
      header: 'Status', 
      accessor: (b: Booking) => (
        <Badge variant={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'error'}>
          {b.status}
        </Badge>
      ) 
    },
    { header: 'Price', accessor: (b: Booking) => formatCurrency(b.total_price) },
  ];

  if (role === 'staff') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-carbon-black">My Tasks</h1>
          <p className="text-cool-gray">Your upcoming service appointments and schedule.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard 
            label="Today's Appointments" 
            value={3} 
            icon={CalendarIcon} 
          />
          <StatCard 
            label="Completed Tasks" 
            value={12} 
            icon={TrendingUp} 
          />
          <StatCard 
            label="Total Hours" 
            value="42h" 
            icon={Clock} 
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-carbon-black">Upcoming Appointments</h3>
            <Button variant="ghost" size="sm">View Schedule</Button>
          </div>
          <DataTable columns={columns} data={recentBookings} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-carbon-black">Operations & Analytics</h1>
        <p className="text-text-description mt-1">Real-time overview of your business performance.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Revenue" 
          value={formatCurrency(stats?.totalRevenue || 0)} 
          icon={DollarSign} 
          trend={{ value: 12, isPositive: true }} 
        />
        <StatCard 
          label="Total Bookings" 
          value={stats?.totalBookings || 0} 
          icon={CalendarIcon} 
          trend={{ value: 8, isPositive: true }} 
        />
        <StatCard 
          label="Active Services" 
          value={stats?.activeServices || 0} 
          icon={Briefcase} 
        />
        <StatCard 
          label="Pending Bookings" 
          value={stats?.pendingBookings || 0} 
          icon={Clock} 
          trend={{ value: 4, isPositive: false }} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border-light bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-semibold text-carbon-black">Revenue Overview</h3>
            <Button variant="outline" size="sm" className="text-xs">
              View Report <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009E60" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#009E60" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94A3B8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94A3B8' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #F1F5F9', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#009E60" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border-light bg-white p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
          <h3 className="text-base font-semibold text-carbon-black mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start text-xs h-11" variant="outline">
              <Briefcase className="mr-3 h-4 w-4 text-slate-400" /> Add New Service
            </Button>
            <Button className="w-full justify-start text-xs h-11" variant="outline">
              <CalendarIcon className="mr-3 h-4 w-4 text-slate-400" /> Schedule Availability
            </Button>
            <Button className="w-full justify-start text-xs h-11" variant="outline">
              <Users className="mr-3 h-4 w-4 text-slate-400" /> Manage Customers
            </Button>
            <Button className="w-full justify-start text-xs h-11" variant="outline">
              <TrendingUp className="mr-3 h-4 w-4 text-slate-400" /> View Analytics
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-carbon-black">Recent Bookings</h3>
          <Button variant="ghost" size="sm" className="text-xs">View All</Button>
        </div>
        <DataTable columns={columns} data={recentBookings} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Dashboard;
