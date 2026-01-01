import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/api';

export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';
export type RoomType = 'single' | 'double' | 'twin' | 'suite' | 'dormitory';

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  name?: string;
  type: RoomType;
  status: RoomStatus;
  floor?: number;
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomData {
  propertyId: string;
  roomNumber: string;
  name?: string;
  type: RoomType;
  floor?: number;
  capacity: number;
  pricePerNight: number;
  amenities?: string[];
  description?: string;
}

export interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
}

export function useRooms(propertyId?: string) {
  return useQuery({
    queryKey: ['rooms', propertyId],
    queryFn: async () => {
      const params = propertyId ? `?propertyId=${propertyId}` : '';
      const response = await api.get(`/rooms${params}`);
      return response.data.data as Room[];
    },
    enabled: !!propertyId,
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['rooms', 'detail', id],
    queryFn: async () => {
      const response = await api.get(`/rooms/${id}`);
      return response.data.data as Room;
    },
    enabled: !!id,
  });
}

export function useRoomStats(propertyId: string) {
  return useQuery({
    queryKey: ['rooms', 'stats', propertyId],
    queryFn: async () => {
      const response = await api.get(`/rooms/stats/${propertyId}`);
      return response.data.data as RoomStats;
    },
    enabled: !!propertyId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoomData) => {
      const response = await api.post('/rooms', data);
      return response.data.data as Room;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'stats', variables.propertyId] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateRoomData> }) => {
      const response = await api.patch(`/rooms/${id}`, data);
      return response.data.data as Room;
    },
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', room.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'detail', room.id] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'stats', room.propertyId] });
    },
  });
}

export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RoomStatus }) => {
      const response = await api.patch(`/rooms/${id}/status`, { status });
      return response.data.data as Room;
    },
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', room.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'stats', room.propertyId] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, propertyId }: { id: string; propertyId: string }) => {
      await api.delete(`/rooms/${id}`);
      return propertyId;
    },
    onSuccess: (propertyId) => {
      queryClient.invalidateQueries({ queryKey: ['rooms', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['rooms', 'stats', propertyId] });
    },
  });
}
