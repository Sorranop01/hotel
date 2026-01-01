import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/lib/api';

export interface Property {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
  roomCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyData {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  email?: string;
}

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await api.get('/properties');
      return response.data.data as Property[];
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: async () => {
      const response = await api.get(`/properties/${id}`);
      return response.data.data as Property;
    },
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePropertyData) => {
      const response = await api.post('/properties', data);
      return response.data.data as Property;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePropertyData> }) => {
      const response = await api.patch(`/properties/${id}`, data);
      return response.data.data as Property;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties', id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
