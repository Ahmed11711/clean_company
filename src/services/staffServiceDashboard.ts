import axiosInstance from '../api/axiosConfig';
import { StaffBooking, BookingStatus } from '../types';

// تعريف شكل الاستجابة القادمة من الباك أند
interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export const staffService = {
  // جلب المهام
  getMyBookings: async (): Promise<ApiResponse<StaffBooking[]>> => {
    const response = await axiosInstance.get('/staff/Dashbaord/bookings');
    return response.data; 
  },

  updateBookingStatus: async (id: number, status: BookingStatus) => {
    const response = await axiosInstance.patch(`/staff/Dashbaord/bookings/${id}/status`, { 
      status 
    });
    return response.data;
  },

  completeBooking: async (id: number, data: { 
    notes: string; 
    beforePhoto?: string; 
    afterPhoto?: string 
  }) => {
    const response = await axiosInstance.post(`/staff/Dashbaord/bookings/${id}/complete`, data);
    return response.data;
  },

  /**
   * إرسال الموقع اللحظي لـ Redis Cloud عبر الباك أند
   * تم استخدام axiosInstance لضمان وجود الـ Base URL والـ Tokens
   */
  sendLocation: async (lat: number, lng: number, userId: number) => {
    const response = await axiosInstance.post('/tracking/update', {
        user_id: userId,
        lat: lat,
        lng: lng
    });
    return response.data;
  },
};