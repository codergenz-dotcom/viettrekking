import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  tripService,
  type Trip,
  type CreateTripPayload,
  type GetTripsParams,
} from '@/services/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export const tripKeys = {
  all: ['trips'] as const,
  lists: () => [...tripKeys.all, 'list'] as const,
  list: (params?: GetTripsParams) => [...tripKeys.lists(), params] as const,
  details: () => [...tripKeys.all, 'detail'] as const,
  detail: (id: string) => [...tripKeys.details(), id] as const,
};

export function useTrips(
  params?: GetTripsParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<Trip>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tripKeys.list(params),
    queryFn: () => tripService.getTrips(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useTrip(
  id: string,
  options?: Omit<UseQueryOptions<ApiResponse<Trip>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: tripKeys.detail(id),
    queryFn: () => tripService.getTripById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateTrip(
  options?: UseMutationOptions<ApiResponse<Trip>, Error, CreateTripPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tripService.createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      toast.success('Tạo chuyến đi thành công!');
    },
    ...options,
  });
}

export function useUpdateTrip(
  options?: UseMutationOptions<
    ApiResponse<Trip>,
    Error,
    { id: string; data: Partial<CreateTripPayload> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => tripService.updateTrip(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      toast.success('Cập nhật chuyến đi thành công!');
    },
    ...options,
  });
}

export function useDeleteTrip(
  options?: UseMutationOptions<ApiResponse<void>, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tripService.deleteTrip,
    onSuccess: (_, tripId) => {
      queryClient.removeQueries({ queryKey: tripKeys.detail(tripId) });
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      toast.success('Xóa chuyến đi thành công!');
    },
    ...options,
  });
}
