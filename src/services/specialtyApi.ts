import axiosInstance from '../api/axiosConfig';
 import { Specialty } from '../types';

export const specialtyApi = {
  getSpecialties: () => axiosInstance.get<Specialty[]>('/specialtiesComapny'),
  createSpecialty: (data: Partial<Specialty>) => axiosInstance.post<Specialty>('/specialtiesComapny', data),
  updateSpecialty: (id: number, data: Partial<Specialty>) => axiosInstance.put<Specialty>(`/specialtiesComapny/${id}`, data),
  deleteSpecialty: (id: number) => axiosInstance.delete(`/specialtiesComapny/${id}`),
};