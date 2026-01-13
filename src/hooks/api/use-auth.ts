import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { authService, type User } from '@/services/api';
import type { ApiResponse } from '@/types/api';

export const authKeys = {
  currentUser: ['auth', 'me'] as const,
};

export function useCurrentUser(
  options?: Omit<UseQueryOptions<ApiResponse<User>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
