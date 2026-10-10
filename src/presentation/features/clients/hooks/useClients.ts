import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { clientUseCases } from '@/src/core/di/container';
import type {
  CreateClientPayload,
  UpdateClientPayload,
} from '@/src/core/domain/repositories/IClientRepository';
import { showToast } from '@/src/presentation/components/shared/Toast';
import { queryKeys } from '@/src/shared/constants/queryKeys';

const INFINITE_PAGE_SIZE = 20;

export function useClients(companyId?: string, search?: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.clients.all(companyId, search, page),
    queryFn: () => clientUseCases.list(companyId, search, page, limit),
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

export function useInfiniteClients(companyId?: string, search?: string) {
  return useInfiniteQuery({
    // Prefijo 'clients' para que invalidateQueries({ queryKey: ['clients'] }) también lo refresque
    queryKey: ['clients', 'infinite', companyId, search],
    queryFn: ({ pageParam }) => clientUseCases.list(companyId, search, pageParam, INFINITE_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled: !!companyId,
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
