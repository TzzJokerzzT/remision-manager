import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { remisionUseCases } from '@/src/core/di/container';
import type {
  CreateRemisionPayload,
  UpdateRemisionPayload,
} from '@/src/core/domain/repositories/IRemisionRepository';
import { queryKeys } from '@/src/shared/constants/queryKeys';

export function useRemisiones(companyId?: string, search?: string) {
  return useQuery({
    queryKey: queryKeys.remisiones.all(companyId, search),
    queryFn: () => remisionUseCases.list(companyId, search),
    enabled: !!companyId,
  });
}

export function useRemision(id: string | null) {
  return useQuery({
    queryKey: queryKeys.remisiones.detail(id ?? ''),
    queryFn: () => remisionUseCases.getById(id as string),
    enabled: !!id,
  });
}

export function useCreateRemision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRemisionPayload) => remisionUseCases.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remisiones'] });
    },
  });
}

export function useUpdateRemision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRemisionPayload }) =>
      remisionUseCases.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remisiones'] });
    },
  });
}

export function useDeleteRemision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remisionUseCases.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remisiones'] });
    },
  });
}
