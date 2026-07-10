import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { companyUseCases } from '@/src/core/di/container';
import type {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from '@/src/core/domain/repositories/ICompanyRepository';
import { showToast } from '@/src/presentation/components/shared/Toast';
import { useCompanyStore } from '@/src/presentation/stores/company.store';
import { queryKeys } from '@/src/shared/constants/queryKeys';

export function useCompanies(search?: string) {
  return useQuery({
    queryKey: queryKeys.companies.all(search),
    queryFn: () => companyUseCases.list(search),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => companyUseCases.create(payload),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
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

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCompanyPayload }) =>
      companyUseCases.update(id, payload),
    onSuccess: ({ message }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
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

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  const { selectedCompany, setSelectedCompany } = useCompanyStore();

  return useMutation({
    mutationFn: (id: string) => companyUseCases.delete(id),
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      if (selectedCompany?.id === deletedId) {
        setSelectedCompany(null);
      }
      showToast('Empresa eliminada exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al eliminar la empresa', 'error');
    },
  });
}
