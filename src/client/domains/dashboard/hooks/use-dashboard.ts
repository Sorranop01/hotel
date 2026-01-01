import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/lib/api';

export interface DashboardStats {
  properties: number;
  rooms: {
    total: number;
    available: number;
    occupied: number;
    cleaning: number;
  };
  bookings: {
    today: number;
    checkIns: number;
    checkOuts: number;
  };
  revenue: {
    today: number;
    month: number;
  };
}

export interface TodayBooking {
  id: string;
  bookingNumber: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  type: 'checkin' | 'checkout';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return response.data.data;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}

export function useTodayBookings() {
  return useQuery({
    queryKey: ['dashboard', 'today-bookings'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<TodayBooking[]>>('/dashboard/today-bookings');
      return response.data.data;
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
