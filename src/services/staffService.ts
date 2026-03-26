import { StaffBooking, BookingStatus } from '../types';

// Mock Data for Staff Bookings
const mockStaffBookings: StaffBooking[] = [
  {
    id: 1,
    customer_name: 'Sarah Miller',
    service_type: 'Deep Cleaning',
    appointment_time: '09:00 AM',
    status: 'confirmed',
  },
  {
    id: 2,
    customer_name: 'James Wilson',
    service_type: 'Garden Maintenance',
    appointment_time: '01:30 PM',
    status: 'confirmed',
  },
  {
    id: 3,
    customer_name: 'Linda Garcia',
    service_type: 'Pool Cleaning',
    appointment_time: '04:00 PM',
    status: 'confirmed',
  },
];

export const staffService = {
  getMyBookings: async (): Promise<StaffBooking[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [...mockStaffBookings];
  },

  updateBookingStatus: async (id: number, status: BookingStatus): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const booking = mockStaffBookings.find((b) => b.id === id);
    if (booking) {
      booking.status = status;
    }
  },

  completeBooking: async (id: number, data: { notes: string; beforePhoto?: string; afterPhoto?: string }): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const booking = mockStaffBookings.find((b) => b.id === id);
    if (booking) {
      booking.status = 'completed';
      booking.notes = data.notes;
      booking.before_photo = data.beforePhoto;
      booking.after_photo = data.afterPhoto;
    }
  },

  sendLocation: async (latitude: number, longitude: number): Promise<void> => {
    // In a real app, this would POST to a tracking endpoint
    console.log(`[Staff Tracking] Sending location: ${latitude}, ${longitude}`);
  },
};
