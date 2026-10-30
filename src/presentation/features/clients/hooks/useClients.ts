import { useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { clientUseCases } from '@/src/core/di/container';
import type { Client } from '@/src/core/domain/entities/Client';
import type {
  CreateClientPayload,
  UpdateClientPayload,
} from '@/src/core/domain/repositories/IClientRepository';
import { showToast } from '@/src/presentation/components/shared/Toast';
import { queryKeys } from '@/src/shared/constants/queryKeys';
import { fetchAllPages } from '@/src/shared/utils/paginate';

const INFINITE_PAGE_SIZE = 20;

export function useClients(companyId?: string, search?: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.clients.all(companyId, search, page),
    queryFn: () => clientUseCases.list(companyId, search, page, limit),
  });
}

/**
 * Resuelve un cliente por su id (`GET /clients/:id`).
 *
 * Necesario porque `GET /clients` pagina de a 10/20 y ordena de más viejo a más nuevo:
 * buscar un cliente dentro de una página deja afuera a los recién creados.
 */
export function useClient(clientId?: string | null) {
  return useQuery({
    queryKey: queryKeys.clients.detail(clientId ?? ''),
    queryFn: () => clientUseCases.getById(clientId as string),
    enabled: !!clientId,
  });
}

/** Igual que `useClient`, pero para los ids de una página de remisiones. */
export function useClientsByIds(clientIds: Array<string | null | undefined>) {
  const uniqueIds = [...new Set(clientIds.filter((id): id is string => !!id))];

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: queryKeys.clients.detail(id),
      queryFn: () => clientUseCases.getById(id),
    })),
  });

  const clientsById = new Map<string, Client>();
  uniqueIds.forEach((id, index) => {
    const client = queries[index]?.data;
    if (client) clientsById.set(id, client);
  });
  return clientsById;
}

/**
 * Todos los clientes de la empresa, recorriendo las páginas del backend.
 *
 * `limit` está topado en 100 por el backend y `maxPages` evita un bucle infinito si el
 * backend informa más páginas de las que existen.
 */
export function useAllClients(companyId?: string) {
  return useQuery({
    queryKey: ['clients', 'all', companyId],
    queryFn: () =>
      fetchAllPages<Client>((page, limit) => clientUseCases.list(companyId, undefined, page, limit), {
        pageSize: 100,
        maxPages: 20,
      }),
    enabled: !!companyId,
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
