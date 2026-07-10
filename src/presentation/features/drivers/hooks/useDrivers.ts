import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { driverUseCases } from '@/src/core/di/container';
import type {
  CreateDriverPayload,
  UpdateDriverPayload,
} from '@/src/core/domain/repositories/IDriverRepository';
import { showToast } from '@/src/presentation/components/shared/Toast';
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
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showToast(message, 'success');
    },
    onError: (error) => {
      const msg =
        (isAxiosError(error) && (error.response?.data as { message?: string })?.message) ||
        (error as Error).message;
      showToast(msg, 'error');
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDriverPayload }) =>
      driverUseCases.update(id, payload),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showToast(message, 'success');
    },
    onError: (error) => {
      const msg =
        (isAxiosError(error) && (error.response?.data as { message?: string })?.message) ||
        (error as Error).message;
      showToast(msg, 'error');
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driverUseCases.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      showToast('Conductor eliminado exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al eliminar el conductor', 'error');
    },
  });
}
