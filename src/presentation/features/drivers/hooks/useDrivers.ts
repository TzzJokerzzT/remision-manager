import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { driverUseCases } from '@/src/core/di/container';
import type { Driver } from '@/src/core/domain/entities/Driver';
import type {
  CreateDriverPayload,
  UpdateDriverPayload,
} from '@/src/core/domain/repositories/IDriverRepository';
import { showToast } from '@/src/presentation/components/shared/Toast';
import { queryKeys } from '@/src/shared/constants/queryKeys';
import { fetchAllPages } from '@/src/shared/utils/paginate';

export function useDrivers(companyId?: string, search?: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.drivers.all(companyId, search, page),
    queryFn: () => driverUseCases.list(companyId, search, page, limit),
  });
}

/**
 * Resuelve un conductor por su id (`GET /drivers/:id`).
 *
 * Necesario porque `GET /drivers` pagina de a 10 y ordena de más viejo a más nuevo: buscar
 * un conductor dentro de una página deja afuera a los recién creados.
 */
export function useDriver(driverId?: string | null) {
  return useQuery({
    queryKey: queryKeys.drivers.detail(driverId ?? ''),
    queryFn: () => driverUseCases.getById(driverId as string),
    // El endpoint responde `{ driver, message }` y la vista solo necesita el conductor.
    select: (result) => result.driver,
    enabled: !!driverId,
  });
}

/** Igual que `useDriver`, pero para los ids de una página de remisiones. */
export function useDriversByIds(driverIds: Array<string | null | undefined>) {
  const uniqueIds = [...new Set(driverIds.filter((id): id is string => !!id))];

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: queryKeys.drivers.detail(id),
      queryFn: () => driverUseCases.getById(id),
      select: (result: { driver: Driver }) => result.driver,
    })),
  });

  const driversById = new Map<string, Driver>();
  uniqueIds.forEach((id, index) => {
    const driver = queries[index]?.data;
    if (driver) driversById.set(id, driver);
  });
  return driversById;
}

/**
 * Todos los conductores de la empresa, recorriendo las páginas del backend.
 *
 * El filtro y el select del formulario necesitan la lista completa: con la primera página
 * un conductor recién creado no aparece.
 */
export function useAllDrivers(companyId?: string) {
  return useQuery({
    queryKey: ['drivers', 'all', companyId],
    queryFn: () =>
      fetchAllPages<Driver>((page, limit) => driverUseCases.list(companyId, undefined, page, limit), {
        pageSize: 100,
        maxPages: 20,
      }),
    enabled: !!companyId,
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
