import axiosInstance from '../api/axiosConfig';
import { Service } from '../types';

export const serviceApi = {
  getServices: async () => {
    const response = await axiosInstance.get('/services');
    return response.data;
  },

  createService: async (data: any, image?: File | null) => {
    const formData = new FormData();

    // نضيف كل الـ fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // نضيف الصورة لو موجودة
    if (image) {
      formData.append('image', image);
    }

    const response = await axiosInstance.post('/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateService: async (id: number, data: any, image?: File | null) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (image) {
      formData.append('image', image);
    }

    // Laravel مش بيدعم PUT مع FormData، نستخدم POST + _method
    formData.append('_method', 'PUT');

    const response = await axiosInstance.post(`/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteService: async (id: number) => {
    const response = await axiosInstance.delete(`/services/${id}`);
    return response.data;
  },

  getAvailability: async () => {
    const response = await axiosInstance.get('/availability');
    return response.data;
  },

  updateAvailability: async (serviceId: number, data: any) => {
    const response = await axiosInstance.post(`/availability/sync/${serviceId}`, data);
    return response.data;
  },

  deleteAvailability: (id: number) => axiosInstance.delete(`/availability/${id}`),
  // ... الكود القديم الموجود في ملف serviceApi.ts

 
  // --- أضف الدوال التالية هنا ---

getServiceItems: async (serviceId: number) => {
  const response = await axiosInstance.get(`/Service-items/${serviceId}`);
  return response.data;
},

  createServiceItem: async (data: any, image?: File | null) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    if (image) {
      formData.append('image', image);
    }
    const response = await axiosInstance.post('/Service-items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateServiceItem: async (id: number, data: any, image?: File | null) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    if (image) {
      formData.append('image', image);
    }
    
    // ملاحظة: إذا كان الباك-إند Laravel، نستخدم POST مع _method=PUT
    // formData.append('_method', 'PUT');
    
    const response = await axiosInstance.post(`/Service-items`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteServiceItem: async (id: number) => {
    const response = await axiosInstance.delete(`/service-items/${id}`);
    return response.data;
  },

};