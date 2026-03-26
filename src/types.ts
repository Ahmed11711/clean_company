export interface CompanyProfile {
  id: number;
  name: string;
  logo: string;
  address: string;
  hourly_rate: number;
  is_verified: boolean;
  description?: string;
  free_delivery?: boolean;
  rating?: number;
}

export interface Service {
  id: number;
  service_name: string;
  price: number;
  price_today: number;
  discount: number;
  standard_bags?: StandardBag[];
}

export interface StandardBag {
  id: number;
  service_id: number;
  description: string;
}

export interface Booking {
  id: number;
  user_id: number;
  user_name: string;
  service_id: number;
  service_name: string;
  booking_date: string;
  start_time: string;
  hours: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'paid' | 'unpaid';
  notes?: string;
}

export interface Availability {
  id: number;
  service_id: number;
  day_of_week: number; // 0-6 for Sunday-Saturday
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeServices: number;
  pendingBookings: number;
}

export interface Staff {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  password?: string;
  role?: 'admin' | 'staff';
}

export type BookingStatus = 'pending' | 'confirmed' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';

export interface StaffBooking {
  id: number;
  customer_name: string;
  service_type: string;
  appointment_time: string;
  status: BookingStatus;
  notes?: string;
  before_photo?: string;
  after_photo?: string;
  start_time?: string;
  end_time?: string;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  image_path: string;
  category_id: number;
  category_name: string;
  is_active: boolean;
  company_id: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}
