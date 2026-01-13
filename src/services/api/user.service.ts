import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { AccountResponse, UpdateProfileRequest } from './types';

export const userService = {
  getCurrentProfile: async (): Promise<ApiResponse<AccountResponse>> => {
    const response = await api.get<ApiResponse<AccountResponse>>('/api/v1/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<AccountResponse>> => {
    const response = await api.put<ApiResponse<AccountResponse>>('/api/v1/users/me', data);
    return response.data;
  },
};
