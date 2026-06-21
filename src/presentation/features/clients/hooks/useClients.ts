import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clientUseCases } from '@/src/core/di/container';
import type {
  CreateClientPayload,
  UpdateClientPayload,
} from '@/src/core/domain/repositories/IClientRepository';
import { queryKeys } from '@/src/shared/constants/queryKeys';

export function useClients(companyId?: string) {
  return useQuery({
    queryKey: queryKeys.clients.all(companyId),
    queryFn: () => clientUseCases.list(companyId),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientUseCases.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientPayload }) =>
      clientUseCases.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientUseCases.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
