import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  TripReviewResponse,
  ApplyStatusResponse,
  RejectPorterApplicationRequest,
  PorterApplicationListItem,
  PorterApplicationStatus,
  TripApprovalStatusResponse,
  RejectTripRequest,
  TripListItemResponse,
  AccountStatistics,
  AdminAccountSummary,
  AdminAccountDetail,
  AdminAccountListParams,
  PaginationRequest,
} from './types';

export const adminService = {
  getReviews: async (params?: PaginationRequest): Promise<PaginatedResponse<TripReviewResponse>> => {
    const response = await api.get<PaginatedResponse<TripReviewResponse>>('/api/v1/admin/reviews', { params });
    return response.data;
  },

  approvePorter: async (id: string): Promise<ApiResponse<ApplyStatusResponse>> => {
    const response = await api.post<ApiResponse<ApplyStatusResponse>>(`/api/v1/admin/porters/${id}/approve`);
    return response.data;
  },

  rejectPorter: async (id: string, data: RejectPorterApplicationRequest): Promise<ApiResponse<ApplyStatusResponse>> => {
    const response = await api.post<ApiResponse<ApplyStatusResponse>>(`/api/v1/admin/porters/${id}/reject`, data);
    return response.data;
  },

  getPorterApplications: async (params: { status?: PorterApplicationStatus; search?: string } & PaginationRequest): Promise<PaginatedResponse<PorterApplicationListItem>> => {
    const response = await api.get<PaginatedResponse<PorterApplicationListItem>>('/api/v1/admin/porters', { params });
    return response.data;
  },

  approveTrip: async (id: string): Promise<ApiResponse<TripApprovalStatusResponse>> => {
    const response = await api.post<ApiResponse<TripApprovalStatusResponse>>(`/api/v1/admin/trips/${id}/approve`);
    return response.data;
  },

  rejectTrip: async (id: string, data: RejectTripRequest): Promise<ApiResponse<TripApprovalStatusResponse>> => {
    const response = await api.post<ApiResponse<TripApprovalStatusResponse>>(`/api/v1/admin/trips/${id}/reject`, data);
    return response.data;
  },

  hideReview: async (reviewId: string): Promise<ApiResponse<TripReviewResponse>> => {
    const response = await api.put<ApiResponse<TripReviewResponse>>(`/api/v1/admin/reviews/${reviewId}/hide`);
    return response.data;
  },

  getTripsForAdmin: async (params: { status?: 'PENDING' | 'APPROVED' | 'REJECTED'; search?: string } & PaginationRequest): Promise<PaginatedResponse<TripListItemResponse>> => {
    const response = await api.get<PaginatedResponse<TripListItemResponse>>('/api/v1/admin/trips', { params });
    return response.data;
  },

  deleteReview: async (reviewId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/v1/admin/reviews/${reviewId}`);
    return response.data;
  },
};

export const adminAccountService = {
  getStatistics: async (): Promise<ApiResponse<AccountStatistics>> => {
    const response = await api.get<ApiResponse<AccountStatistics>>('/api/v1/admin/accounts/statistics');
    return response.data;
  },

  getAccounts: async (params?: AdminAccountListParams): Promise<PaginatedResponse<AdminAccountSummary>> => {
    const response = await api.get<PaginatedResponse<AdminAccountSummary>>('/api/v1/admin/accounts', { params });
    return response.data;
  },

  getAccountDetail: async (id: string): Promise<ApiResponse<AdminAccountDetail>> => {
    const response = await api.get<ApiResponse<AdminAccountDetail>>(`/api/v1/admin/accounts/${id}`);
    return response.data;
  },

  activateAccount: async (id: string): Promise<ApiResponse<AdminAccountDetail>> => {
    const response = await api.patch<ApiResponse<AdminAccountDetail>>(`/api/v1/admin/accounts/${id}/activate`);
    return response.data;
  },

  deactivateAccount: async (id: string): Promise<ApiResponse<AdminAccountDetail>> => {
    const response = await api.patch<ApiResponse<AdminAccountDetail>>(`/api/v1/admin/accounts/${id}/deactivate`);
    return response.data;
  },

  banAccount: async (id: string): Promise<ApiResponse<AdminAccountDetail>> => {
    const response = await api.patch<ApiResponse<AdminAccountDetail>>(`/api/v1/admin/accounts/${id}/ban`);
    return response.data;
  },
};
