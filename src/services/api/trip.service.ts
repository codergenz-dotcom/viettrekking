import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  Trip,
  CreateTripPayload,
  GetTripsParams,
  CreateUserTripPayload,
  TripListItemResponse,
  TripResponse,
  SearchTripsParams,
  JoinTripRequest,
  TripRegistrationResponse,
  UpdateRegistrationStatusRequest,
  MyRegistrationStatusResponse,
  SubmitPorterApplicationRequest,
  ApplyStatusResponse,
  PaginationRequest,
  TripStatus,
  UpdateTripStatusRequest,
} from './types';

export const tripService = {
  getTrips: async (params?: GetTripsParams): Promise<PaginatedResponse<Trip>> => {
    const response = await api.get<PaginatedResponse<Trip>>('/trips', { params });
    return response.data;
  },

  getTripById: async (id: string): Promise<ApiResponse<Trip>> => {
    const response = await api.get<ApiResponse<Trip>>(`/trips/${id}`);
    return response.data;
  },

  createTrip: async (data: CreateTripPayload): Promise<ApiResponse<Trip>> => {
    const response = await api.post<ApiResponse<Trip>>('/trips', data);
    return response.data;
  },

  updateTrip: async (id: string, data: Partial<CreateTripPayload>): Promise<ApiResponse<Trip>> => {
    const response = await api.patch<ApiResponse<Trip>>(`/trips/${id}`, data);
    return response.data;
  },

  deleteTrip: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/trips/${id}`);
    return response.data;
  },
};

// User trip service
export const userTripService = {
  getActiveTrips: async (params?: PaginationRequest): Promise<PaginatedResponse<TripListItemResponse>> => {
    const response = await api.get<PaginatedResponse<TripListItemResponse>>('/api/v1/user/trips', { params });
    return response.data;
  },

  getTripById: async (id: string): Promise<ApiResponse<TripResponse>> => {
    const response = await api.get<ApiResponse<TripResponse>>(`/api/v1/user/trips/${id}`);
    return response.data;
  },

  createTrip: async (data: CreateUserTripPayload): Promise<ApiResponse<TripResponse>> => {
    const response = await api.post<ApiResponse<TripResponse>>('/api/v1/user/trips', data);
    return response.data;
  },

  updateTrip: async (id: string, data: Partial<CreateUserTripPayload>): Promise<ApiResponse<TripResponse>> => {
    const response = await api.put<ApiResponse<TripResponse>>(`/api/v1/user/trips/${id}`, data);
    return response.data;
  },

  searchTrips: async (params: SearchTripsParams, pagination?: PaginationRequest): Promise<PaginatedResponse<TripListItemResponse>> => {
    const response = await api.get<PaginatedResponse<TripListItemResponse>>('/api/v1/user/trips/search', {
      params: { ...params, ...pagination }
    });
    return response.data;
  },

  deleteTrip: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/v1/user/trips/${id}`);
    return response.data;
  },

  applyForPorter: async (data: SubmitPorterApplicationRequest): Promise<ApiResponse<ApplyStatusResponse>> => {
    const response = await api.post<ApiResponse<ApplyStatusResponse>>('/api/v1/user/porters/apply', data);
    return response.data;
  },

  getMyPorterApplication: async (): Promise<ApiResponse<ApplyStatusResponse>> => {
    const response = await api.get<ApiResponse<ApplyStatusResponse>>('/api/v1/user/porters/me');
    return response.data;
  },

  joinTrip: async (tripId: string, data: JoinTripRequest): Promise<ApiResponse<TripRegistrationResponse>> => {
    const response = await api.post<ApiResponse<TripRegistrationResponse>>(`/api/v1/user/trips/${tripId}/registrations`, data);
    return response.data;
  },

  getTripMembers: async (tripId: string): Promise<ApiResponse<TripRegistrationResponse[]>> => {
    const response = await api.get<ApiResponse<TripRegistrationResponse[]>>(`/api/v1/user/trips/${tripId}/registrations`);
    return response.data;
  },

  getMyRegistrationStatus: async (tripId: string): Promise<ApiResponse<MyRegistrationStatusResponse>> => {
    const response = await api.get<ApiResponse<MyRegistrationStatusResponse>>(`/api/v1/user/trips/${tripId}/registrations/me`);
    return response.data;
  },

  getMyTrips: async (filterType: 'CREATED' | 'APPLIED' | 'COMPLETED', params?: PaginationRequest): Promise<PaginatedResponse<TripListItemResponse>> => {
    const response = await api.get<PaginatedResponse<TripListItemResponse>>('/api/v1/user/trips/my-trips', {
      params: { filter_type: filterType, ...params }
    });
    return response.data;
  },

  updateRegistrationStatus: async (tripId: string, registrationId: string, data: UpdateRegistrationStatusRequest): Promise<ApiResponse<TripRegistrationResponse>> => {
    const response = await api.put<ApiResponse<TripRegistrationResponse>>(`/api/v1/user/trips/${tripId}/registrations/${registrationId}`, data);
    return response.data;
  },

  updateTripStatus: async (tripId: string, data: UpdateTripStatusRequest): Promise<ApiResponse<void>> => {
    const response = await api.patch<ApiResponse<void>>(`/api/v1/user/trips/${tripId}/status`, data);
    return response.data;
  },
};
