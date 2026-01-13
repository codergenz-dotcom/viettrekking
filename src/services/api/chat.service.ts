import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  ConversationResponse,
  ConversationDetailResponse,
  MessageResponse,
  CreateDirectConversationRequest,
  SendMessageRequest,
  PaginationRequest,
} from './types';

export const chatService = {
  getConversations: async (params?: PaginationRequest): Promise<PaginatedResponse<ConversationResponse>> => {
    const response = await api.get<PaginatedResponse<ConversationResponse>>('/api/v1/user/chat/conversations', { params });
    return response.data;
  },

  getConversationById: async (conversationId: string): Promise<ApiResponse<ConversationDetailResponse>> => {
    const response = await api.get<ApiResponse<ConversationDetailResponse>>(`/api/v1/user/chat/conversations/${conversationId}`);
    return response.data;
  },

  createDirectConversation: async (data: CreateDirectConversationRequest): Promise<ApiResponse<ConversationResponse>> => {
    const response = await api.post<ApiResponse<ConversationResponse>>('/api/v1/user/chat/conversations/direct', data);
    return response.data;
  },

  getTripGroupChat: async (tripId: string): Promise<ApiResponse<ConversationResponse>> => {
    const response = await api.get<ApiResponse<ConversationResponse>>(`/api/v1/user/chat/conversations/trip/${tripId}`);
    return response.data;
  },

  sendMessage: async (data: SendMessageRequest): Promise<ApiResponse<MessageResponse>> => {
    const response = await api.post<ApiResponse<MessageResponse>>('/api/v1/user/chat/messages', data);
    return response.data;
  },

  getMessages: async (conversationId: string, params?: PaginationRequest): Promise<PaginatedResponse<MessageResponse>> => {
    const response = await api.get<PaginatedResponse<MessageResponse>>(`/api/v1/user/chat/conversations/${conversationId}/messages`, { params });
    return response.data;
  },

  markAsRead: async (conversationId: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/api/v1/user/chat/conversations/${conversationId}/read`);
    return response.data;
  },
};
