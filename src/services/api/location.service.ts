import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Location, CreateLocationPayload, UpdateLocationPayload, LocationListParams } from './types/location.types';

export const locationService = {
    getLocations: async (params?: LocationListParams): Promise<PaginatedResponse<Location>> => {
        // In a real app, this would be an API call. 
        // For now, we might need to mock if the endpoint doesn't exist yet, 
        // but the instruction says "thêm" (add), implying I should implement the service.
        const response = await api.get<PaginatedResponse<Location>>('/api/v1/locations', { params });
        return response.data;
    },

    getLocationById: async (id: string): Promise<ApiResponse<Location>> => {
        const response = await api.get<ApiResponse<Location>>(`/api/v1/locations/${id}`);
        return response.data;
    },

    createLocation: async (data: CreateLocationPayload): Promise<ApiResponse<Location>> => {
        const response = await api.post<ApiResponse<Location>>('/api/v1/locations', data);
        return response.data;
    },

    updateLocation: async (id: string, data: UpdateLocationPayload): Promise<ApiResponse<Location>> => {
        const response = await api.put<ApiResponse<Location>>(`/api/v1/locations/${id}`, data);
        return response.data;
    },

    deleteLocation: async (id: string): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/api/v1/locations/${id}`);
        return response.data;
    },
};
