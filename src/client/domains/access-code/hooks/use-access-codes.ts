import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/api';
import type { AccessCode } from '@shared/schemas';

export interface AccessCodeWithBooking extends AccessCode {
  bookingNumber?: string;
  guestName?: string;
}

interface SearchAccessCodesParams {
  propertyId: string;
  includeExpired?: boolean;
}

// Get access codes for property
export function useAccessCodes(params: SearchAccessCodesParams) {
  return useQuery({
    queryKey: ['access-codes', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('propertyId', params.propertyId);
      if (params.includeExpired) {
        searchParams.set('includeExpired', 'true');
      }

      const response = await api.get(`/access-codes?${searchParams.toString()}`) as { success: boolean; data: AccessCodeWithBooking[] };
      return response.data;
    },
    enabled: !!params.propertyId,
  });
}

// Get access codes for a specific booking
export function useBookingAccessCodes(bookingId: string) {
  return useQuery({
    queryKey: ['access-codes', 'booking', bookingId],
    queryFn: async () => {
      const response = await api.get(`/access-codes/booking/${bookingId}`) as { success: boolean; data: AccessCode[] };
      return response.data;
    },
    enabled: !!bookingId,
  });
}

// Generate access code
export function useGenerateAccessCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bookingId: string; validFrom?: Date; validUntil?: Date }) => {
      const response = await api.post('/access-codes/generate', data) as { success: boolean; data: AccessCode };
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-codes'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// Regenerate access code
export function useRegenerateAccessCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await api.post(`/access-codes/regenerate/${bookingId}`) as { success: boolean; data: AccessCode };
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-codes'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// Revoke access code
export function useRevokeAccessCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/access-codes/${id}/revoke`, { reason }) as { success: boolean; data: AccessCode };
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-codes'] });
    },
  });
}

// Validate access code (for testing)
export function useValidateAccessCode() {
  return useMutation({
    mutationFn: async ({ code, propertyId }: { code: string; propertyId?: string }) => {
      const response = await api.post('/access-codes/validate', { code, propertyId }) as {
        success: boolean;
        data: {
          isValid: boolean;
          message: string;
          booking?: {
            id: string;
            guestName: string;
            roomName: string;
            checkIn: Date;
            checkOut: Date;
          };
        };
      };
      return response.data;
    },
  });
}

// Cleanup expired codes
export function useCleanupExpiredCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      const response = await api.post(`/access-codes/cleanup/${propertyId}`) as { success: boolean; data: { cleanedCount: number } };
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-codes'] });
    },
  });
}
