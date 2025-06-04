import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { useApi } from './useApi';

// Swap types based on the backend models
export interface Swap {
  id: number;
  issued_battery_id?: number;
  returned_battery_id?: number;
  user_id: number;
  pickup_station_id?: number;
  deposit_station_id?: number;
  start_time?: string;
  end_time?: string;
  battery_percentage_start?: number;
  battery_percentage_end?: number;
  ah_used?: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export interface CreateSwapData {
  user_id: number;
  issued_battery_id?: number;
  returned_battery_id?: number;
  pickup_station_id?: number;
  deposit_station_id?: number;
  start_time?: string;
  end_time?: string;
  battery_percentage_start?: number;
  battery_percentage_end?: number;
  ah_used?: number;
}

export interface UpdateSwapData {
  user_id?: number;
  issued_battery_id?: number;
  returned_battery_id?: number;
  pickup_station_id?: number;
  deposit_station_id?: number;
  start_time?: string;
  end_time?: string;
  battery_percentage_start?: number;
  battery_percentage_end?: number;
  ah_used?: number;
}

// Hook to fetch all swaps
export function useSwaps() {
  return useApi<Swap[]>('/swaps');
}

// Hook to fetch a single swap by ID
export function useSwap(id: number | null) {
  return useApi<Swap>(
    `/swaps/${id}`,
    {
      immediate: !!id,
      dependencies: [id],
    }
  );
}

// Hook to fetch swaps by user
export function useUserSwaps(userId: number | null) {
  return useApi<Swap[]>(
    `/users/${userId}/swaps`,
    {
      immediate: !!userId,
      dependencies: [userId],
    }
  );
}

// Hook to create a new swap
export function useCreateSwap() {
  return useMutation<{ message: string; swap_id: number }, Error, CreateSwapData>({
    mutationFn: (data) => api.post('/swaps', data)
  });
}

// Hook to update a swap
export function useUpdateSwap() {
  return useMutation<{ message: string }, Error, { id: number; data: UpdateSwapData }>({
    mutationFn: ({ id, data }) => api.put(`/swaps/${id}`, data)
  });
}

// Hook to delete a swap
export function useDeleteSwap() {
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => api.delete(`/swaps/${id}`)
  });
}

// Custom hook with additional swap-specific functionality
export function useSwapManagement() {
  const swapsQuery = useSwaps();
  const createSwap = useCreateSwap();
  const updateSwap = useUpdateSwap();
  const deleteSwap = useDeleteSwap();

  const refreshSwaps = useCallback(() => {
    swapsQuery.refetch();
  }, [swapsQuery]);

  const createSwapWithRefresh = useCallback(async (data: CreateSwapData) => {
    await createSwap.mutateAsync(data);
    refreshSwaps();
  }, [createSwap, refreshSwaps]);

  const updateSwapWithRefresh = useCallback(async (id: number, data: UpdateSwapData) => {
    await updateSwap.mutateAsync({ id, data });
    refreshSwaps();
  }, [updateSwap, refreshSwaps]);

  const deleteSwapWithRefresh = useCallback(async (id: number) => {
    await deleteSwap.mutateAsync(id);
    refreshSwaps();
  }, [deleteSwap, refreshSwaps]);

  return {
    // Data
    swaps: swapsQuery.data || [],
    loading: swapsQuery.isLoading,
    error: swapsQuery.error,
    
    // Actions
    refreshSwaps,
    createSwap: createSwapWithRefresh,
    updateSwap: updateSwapWithRefresh,
    deleteSwap: deleteSwapWithRefresh,
    
    // Mutation states
    creating: createSwap.isPending,
    updating: updateSwap.isPending,
    deleting: deleteSwap.isPending,
    
    // Mutation errors
    createError: createSwap.error,
    updateError: updateSwap.error,
    deleteError: deleteSwap.error,
  };
}