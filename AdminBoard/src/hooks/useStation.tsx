import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { useApi } from './useApi';
import { Battery } from './useBatteries';

// Station types based on the backend models
export interface Station {
  id: number;
  location?: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Slot {
  id: number;
  station_id: number;
  slot_number: number;
  battery_id?: number;
  status: string; // 'empty', 'occupied', 'faulty'
  is_charging: boolean;
  last_updated: string;
}

export interface CreateStationData {
  name: string;
  location?: string;
}

export interface UpdateStationData {
  name?: string;
  location?: string;
}

// Hook to fetch all stations
export function useStations() {
  return useApi<Station[]>('/stations');
}

// Hook to fetch a single station by ID
export function useStation(id: number | null) {
  return useApi<Station>(
    `/stations/${id}`,
    {
      immediate: !!id,
      dependencies: [id],
    }
  );
}

// Hook to fetch station slots
export function useStationSlots(stationId: number | null) {
  return useApi<Slot[]>(
    `/stations/${stationId}/slots`,
    {
      immediate: !!stationId,
      dependencies: [stationId],
    }
  );
}

// Hook to fetch station batteries
export function useStationBatteries(stationId: number | null) {
  return useApi<Battery[]>(
    `/stations/${stationId}/batteries`,
    {
      immediate: !!stationId,
      dependencies: [stationId],
    }
  );
}

// Hook to create a new station
export function useCreateStation() {
  return useMutation<Station, Error, CreateStationData>({
    mutationFn: (data) => api.post('/stations', data)
  });
}

// Hook to update a station
export function useUpdateStation() {
  return useMutation<{ message: string }, Error, { id: number; data: UpdateStationData }>({
    mutationFn: ({ id, data }) => api.put(`/stations/${id}`, data)
  });
}

// Hook to delete a station
export function useDeleteStation() {
  return useMutation<{ message: string }, Error, number>({
    mutationFn: (id) => api.delete(`/stations/${id}`)
  });
}

// Custom hook with additional station-specific functionality
export function useStationManagement() {
  const stationsQuery = useStations();
  const createStation = useCreateStation();
  const updateStation = useUpdateStation();
  const deleteStation = useDeleteStation();

  const refreshStations = useCallback(() => {
    stationsQuery.refetch();
  }, [stationsQuery]);

  const createStationWithRefresh = useCallback(async (data: CreateStationData) => {
    await createStation.mutateAsync(data);
    refreshStations();
  }, [createStation, refreshStations]);

  const updateStationWithRefresh = useCallback(async (id: number, data: UpdateStationData) => {
    await updateStation.mutateAsync({ id, data });
    refreshStations();
  }, [updateStation, refreshStations]);

  const deleteStationWithRefresh = useCallback(async (id: number) => {
    await deleteStation.mutateAsync(id);
    refreshStations();
  }, [deleteStation, refreshStations]);

  return {
    // Data
    stations: stationsQuery.data || [],
    loading: stationsQuery.isLoading,
    error: stationsQuery.error,
    
    // Actions
    refreshStations,
    createStation: createStationWithRefresh,
    updateStation: updateStationWithRefresh,
    deleteStation: deleteStationWithRefresh,
    
    // Mutation states
    creating: createStation.isPending,
    updating: updateStation.isPending,
    deleting: deleteStation.isPending,
    
    // Mutation errors
    createError: createStation.error,
    updateError: updateStation.error,
    deleteError: deleteStation.error,
  };
}