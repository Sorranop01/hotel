import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/api';
import type { Booking, AdminCreateBookingInput, UpdateBookingInput } from '@shared/schemas';
import type { BookingStatus } from '@shared/constants';

export interface BookingWithRoom extends Booking {
  room: {
    id: string;
    name: string;
    roomNumber: string;
    type: string;
  } | null;
}

interface SearchBookingsParams {
  propertyId: string;
  status?: BookingStatus;
  fromDate?: string;
  toDate?: string;
  guestName?: string;
}

// Get bookings list
export function useBookings(params: SearchBookingsParams) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.propertyId) searchParams.set('propertyId', params.propertyId);
      if (params.status) searchParams.set('status', params.status);
      if (params.fromDate) searchParams.set('fromDate', params.fromDate);
      if (params.toDate) searchParams.set('toDate', params.toDate);
      if (params.guestName) searchParams.set('guestName', params.guestName);

      const response = await api.get(`/bookings?${searchParams.toString()}`) as { success: boolean; data: Booking[] };
      return response.data;
    },
    enabled: !!params.propertyId,
  });
}

// Get single booking
export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const response = await api.get(`/bookings/${id}`) as { success: boolean; data: BookingWithRoom };
      return response.data;
    },
    enabled: !!id,
  });
}

// Create booking (admin)
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AdminCreateBookingInput) => {
      const response = await api.post('/bookings/admin', data) as { success: boolean; data: Booking };
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Update booking
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBookingInput }) => {
      const response = await api.patch(`/bookings/${id}`, data) as { success: boolean; data: Booking };
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Confirm booking
export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/bookings/${id}/confirm`) as { success: boolean; data: Booking };
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Check in
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/bookings/${id}/checkin`) as { success: boolean; data: Booking };
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

// Check out
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/bookings/${id}/checkout`) as { success: boolean; data: Booking };
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

// Cancel booking
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/bookings/${id}/cancel`) as { success: boolean; data: Booking };
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Record payment
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount, method }: { id: string; amount: number; method?: string }) => {
      const response = await api.post(`/bookings/${id}/payment`, { amount, method }) as { success: boolean; data: Booking };
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
