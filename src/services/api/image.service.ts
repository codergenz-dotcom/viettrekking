import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { ImageResponse, ImageMetadata, PaginationRequest } from './types';

export const imageService = {
  uploadImage: async (file: File): Promise<ApiResponse<ImageResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<ImageResponse>>('/api/v1/user/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getUserImages: async (params?: PaginationRequest): Promise<PaginatedResponse<ImageResponse>> => {
    const response = await api.get<PaginatedResponse<ImageResponse>>('/api/v1/user/images', { params });
    return response.data;
  },

  getImageMetadata: async (id: string): Promise<ApiResponse<ImageMetadata>> => {
    const response = await api.get<ApiResponse<ImageMetadata>>(`/api/v1/user/images/${id}/metadata`);
    return response.data;
  },

  getImageUrl: (id: string): string => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    return `${baseURL}/api/v1/images/${id}`;
  },

  deleteImage: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/v1/user/images/${id}`);
    return response.data;
  },
};
