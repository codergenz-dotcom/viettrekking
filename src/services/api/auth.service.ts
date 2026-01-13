import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  LoginPayload,
  LoginResponse,
  RefreshTokenPayload,
  GoogleLoginRequest,
  GoogleLoginResponse,
} from './types';

export const authService = {
  login: async (data: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.get<ApiResponse<LoginResponse>>('/api/v1/auth/me');
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>('/api/v1/auth/logout');
    return response.data;
  },

  refreshToken: async (data: RefreshTokenPayload): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/api/v1/auth/refresh', data);
    return response.data;
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<ApiResponse<GoogleLoginResponse>> => {
    const response = await api.post<ApiResponse<GoogleLoginResponse>>('/api/v1/auth/google/login', data);
    return response.data;
  },
};
