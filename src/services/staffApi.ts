import axiosInstance from '../api/axiosConfig';

export const staffApi = {
  // جلب كل الموظفين
  getStaff: async () => {
    const response = await axiosInstance.get('/staff');
    return response.data; 
  },

  // إضافة موظف جديد
  createStaff: async (data: any) => {
    const response = await axiosInstance.post('/staff', data);
    return response.data;
  },

  // تحديث بيانات موظف
  updateStaff: async (id: number, data: any) => {
    const response = await axiosInstance.put(`/staff/${id}`, data);
    return response.data;
  },

  // حذف الموظف
  deleteStaff: async (id: number) => {
    const response = await axiosInstance.delete(`/staff/${id}`);
    return response.data;
  },

  /**
   * جلب الموقع الحي لموظف معين من الـ Redis
   * المسار في الـ Backend هو: /api/v1/company/tracking/staff/{id}
   * وبما أن الـ axiosInstance غالباً فيه baseURL ينتهي بـ /v1/company
   */
  getStaffLocation: async (id: number) => {
    const response = await axiosInstance.get(`/tracking/staff/${id}`);
    return response.data; // المفروض يرجع { lat: "...", lng: "..." }
  },

  // جلب كل المواقع (لو هتعرض كل الموظفين على الخريطة مرة واحدة)
  getStaffLocations: async () => {
    const response = await axiosInstance.get('/tracking/staff/all'); // تأكد من وجود المسار في الباك
    return response.data;
  }
};