import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, RequestConfig } from '@/types/api';
import type { NotificationResponse, UnreadCountResponse, PaginationRequest } from './types';

export const notificationService = {
  getNotifications: async (params?: PaginationRequest, config?: RequestConfig): Promise<PaginatedResponse<NotificationResponse>> => {
    const response = await api.get<PaginatedResponse<NotificationResponse>>('/api/v1/notifications', { params, ...config } as any);
    return response.data;
  },

  getUnreadCount: async (config?: RequestConfig): Promise<ApiResponse<UnreadCountResponse>> => {
    const response = await api.get<ApiResponse<UnreadCountResponse>>('/api/v1/notifications/unread-count', config as any);
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.patch<ApiResponse<void>>(`/api/v1/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await api.patch<ApiResponse<void>>('/api/v1/notifications/read-all');
    return response.data;
  },
};
