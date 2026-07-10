import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { clientUseCases } from '@/src/core/di/container';
import type {
  CreateClientPayload,
  UpdateClientPayload,
} from '@/src/core/domain/repositories/IClientRepository';
import { showToast } from '@/src/presentation/components/shared/Toast';
import { queryKeys } from '@/src/shared/constants/queryKeys';

export function useClients(companyId?: string, search?: string) {
  return useQuery({
    queryKey: queryKeys.clients.all(companyId, search),
    queryFn: () => clientUseCases.list(companyId, search),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientUseCases.create(payload),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
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

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientPayload }) =>
      clientUseCases.update(id, payload),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
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

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientUseCases.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast('Cliente eliminado exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al eliminar el cliente', 'error');
    },
  });
}
