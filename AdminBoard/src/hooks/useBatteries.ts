import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { useApi } from './useApi';

// Battery types based on the backend models
export interface Battery {
  id: number;
  station_id?: number;
  status: string;
  serial_number: string;
  battery_type?: string;
  battery_capacity?: number;
  manufacture_date?: string;
  created_at: string;
  updated_at: string;
  latest_soh_percent?: number | null; // Added from backend
  latest_cycle_count?: number | null;  // Added from backend
}

export interface BatteryHealthLog {
  id: number;
  battery_id: number;
  soh_percent?: number;
  pack_voltage?: number;
  cell_voltage_min?: number;
  cell_voltage_max?: number;
  cell_voltage_diff?: number;
  max_temp?: number;
  ambient_temp?: number;
  humidity?: number;
  internal_resist?: number;
  cycle_count?: number;
  error_code?: string;
  created_at: string;
}

export interface CreateBatteryData {
  station_id?: number;
  status: string;
  serial_number: string;
  battery_type?: string;
  battery_capacity?: number;
  manufacture_date?: string;
}

export interface UpdateBatteryData {
  station_id?: number;
  status?: string;
  battery_type?: string;
  battery_capacity?: number;
  manufacture_date?: string;
}

// Hook to fetch all batteries
export function useBatteries() {
  return useApi<Battery[]>('/batteries');
}

// Hook to fetch a single battery by ID
export function useBattery(id: number | null) {
  return useApi<Battery>(
    `/batteries/${id}`,
    {
      immediate: !!id,
      dependencies: [id],
    }
  );
}

// Hook to fetch battery health logs for a specific battery
export function useBatteryHealthLogs(batteryId: number | null) {
  return useApi<BatteryHealthLog[]>(
    `/batteries/${batteryId}/health-logs`,
    {
      immediate: !!batteryId,
      dependencies: [batteryId],
    }
  );
}

// Hook to fetch batteries by station
export function useBatteriesByStation(stationId: number | null) {
  return useApi<Battery[]>(
    `/stations/${stationId}/batteries`,
    {
      immediate: !!stationId,
      dependencies: [stationId],
    }
  );
}

// Hook to create a new battery
export function useCreateBattery() {
  return useMutation<Battery, Error, CreateBatteryData>({
    mutationFn: (data) => api.post('/batteries', data)
  });
}

// Hook to update a battery
export function useUpdateBattery() {
  return useMutation<Battery, Error, { id: number; data: UpdateBatteryData }>({
    mutationFn: ({ id, data }) => api.put(`/batteries/${id}`, data)
  });
}

// Hook to delete a battery
export function useDeleteBattery() {
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => api.delete(`/batteries/${id}`)
  });
}

// Hook to update battery status
export function useUpdateBatteryStatus() {
  return useMutation<Battery, Error, { id: number; status: string }>({
    mutationFn: ({ id, status }) => api.patch(`/batteries/${id}/status`, { status })
  });
}

// Custom hook with additional battery-specific functionality
export function useBatteryManagement() {
  const batteriesQuery = useBatteries();
  const createBattery = useCreateBattery();
  const updateBattery = useUpdateBattery();
  const deleteBattery = useDeleteBattery();
  const updateStatus = useUpdateBatteryStatus();

  const refreshBatteries = useCallback(() => {
    batteriesQuery.refetch();
  }, [batteriesQuery]);

  const createBatteryWithRefresh = useCallback(async (data: CreateBatteryData) => {
    await createBattery.mutateAsync(data);
    refreshBatteries();
  }, [createBattery, refreshBatteries]);

  const updateBatteryWithRefresh = useCallback(async (id: number, data: UpdateBatteryData) => {
    await updateBattery.mutateAsync({ id, data });
    refreshBatteries();
  }, [updateBattery, refreshBatteries]);

  const deleteBatteryWithRefresh = useCallback(async (id: number) => {
    await deleteBattery.mutateAsync(id);
    refreshBatteries();
  }, [deleteBattery, refreshBatteries]);

  const updateBatteryStatusWithRefresh = useCallback(async (id: number, status: string) => {
    await updateStatus.mutateAsync({ id, status });
    refreshBatteries();
  }, [updateStatus, refreshBatteries]);

  return {
    // Data
    batteries: batteriesQuery.data || [],
    loading: batteriesQuery.isLoading,
    error: batteriesQuery.error,
    
    // Actions
    refreshBatteries,
    createBattery: createBatteryWithRefresh,
    updateBattery: updateBatteryWithRefresh,
    deleteBattery: deleteBatteryWithRefresh,
    updateBatteryStatus: updateBatteryStatusWithRefresh,
    
    // Mutation states
    creating: createBattery.isPending,
    updating: updateBattery.isPending,
    deleting: deleteBattery.isPending,
    updatingStatus: updateStatus.isPending,
    
    // Mutation errors
    createError: createBattery.error,
    updateError: updateBattery.error,
    deleteError: deleteBattery.error,
    statusError: updateStatus.error,
  };
}