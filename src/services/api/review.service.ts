import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  CreateReviewRequest,
  UpdateReviewRequest,
  TripReviewResponse,
  ReviewSummaryResponse,
  PaginationRequest,
} from './types';

export const reviewService = {
  getReviews: async (tripId: string, params: PaginationRequest): Promise<PaginatedResponse<TripReviewResponse>> => {
    const response = await api.get<PaginatedResponse<TripReviewResponse>>(`/api/v1/user/trips/${tripId}/reviews`, { params });
    return response.data;
  },

  createReview: async (tripId: string, data: CreateReviewRequest): Promise<ApiResponse<TripReviewResponse>> => {
    const response = await api.post<ApiResponse<TripReviewResponse>>(`/api/v1/user/trips/${tripId}/reviews`, data);
    return response.data;
  },

  getReviewSummary: async (tripId: string): Promise<ApiResponse<ReviewSummaryResponse>> => {
    const response = await api.get<ApiResponse<ReviewSummaryResponse>>(`/api/v1/user/trips/${tripId}/reviews/summary`);
    return response.data;
  },

  updateReview: async (tripId: string, reviewId: string, data: UpdateReviewRequest): Promise<ApiResponse<TripReviewResponse>> => {
    const response = await api.put<ApiResponse<TripReviewResponse>>(`/api/v1/user/trips/${tripId}/reviews/${reviewId}`, data);
    return response.data;
  },

  deleteReview: async (tripId: string, reviewId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/v1/user/trips/${tripId}/reviews/${reviewId}`);
    return response.data;
  },
};
