import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driverUseCases } from '@/src/core/di/container';
import type {
  CreateDriverPayload,
  UpdateDriverPayload,
} from '@/src/core/domain/repositories/IDriverRepository';
import { queryKeys } from '@/src/shared/constants/queryKeys';

export function useDrivers(companyId?: string, search?: string) {
  return useQuery({
    queryKey: queryKeys.drivers.all(companyId, search),
    queryFn: () => driverUseCases.list(companyId, search),
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDriverPayload) => driverUseCases.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDriverPayload }) =>
      driverUseCases.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driverUseCases.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
