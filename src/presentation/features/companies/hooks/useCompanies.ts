import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companyUseCases } from '@/src/core/di/container';
import type {
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from '@/src/core/domain/repositories/ICompanyRepository';
import { useCompanyStore } from '@/src/presentation/stores/company.store';
import { queryKeys } from '@/src/shared/constants/queryKeys';

export function useCompanies() {
  return useQuery({
    queryKey: queryKeys.companies.all,
    queryFn: () => companyUseCases.list(),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => companyUseCases.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCompanyPayload }) =>
      companyUseCases.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  const { selectedCompany, setSelectedCompany } = useCompanyStore();

  return useMutation({
    mutationFn: (id: string) => companyUseCases.delete(id),
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
      if (selectedCompany?.id === deletedId) {
        setSelectedCompany(null);
      }
    },
  });
}
