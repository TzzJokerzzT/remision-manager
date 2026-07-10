import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { remisionUseCases } from '@/src/core/di/container';
import type {
  CreateRemisionPayload,
  UpdateRemisionPayload,
} from '@/src/core/domain/repositories/IRemisionRepository';
import { showToast } from '@/src/presentation/components/shared/Toast';
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
      showToast('Remisión creada exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al crear la remisión', 'error');
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
      showToast('Remision actualizada exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al actualizar la remisión', 'error');
    },
  });
}

export function useDeleteRemision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remisionUseCases.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remisiones'] });
      showToast('Remision eliminada exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al eliminar la remisión', 'error');
    },
  });
}
