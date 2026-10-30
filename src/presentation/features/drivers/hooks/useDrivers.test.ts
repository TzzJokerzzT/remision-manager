import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { driverUseCases } from '@/src/core/di/container';
import type { Driver } from '@/src/core/domain/entities/Driver';
import { useAllDrivers, useDriver, useDriversByIds } from './useDrivers';

jest.mock('@/src/core/di/container', () => ({
  driverUseCases: { getById: jest.fn(), list: jest.fn() },
}));

const getById = driverUseCases.getById as unknown as jest.Mock;
const list = driverUseCases.list as unknown as jest.Mock;

function buildDriver(id: string, name: string): Driver {
  return {
    id,
    name,
    documentId: `doc-${id}`,
    companyId: 'company-1',
    ownerId: 'owner-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

const driverA = buildDriver('driver-a', 'Conductor A');
const driverB = buildDriver('driver-b', 'Conductor B');

// `GET /drivers/:id` responde `{ driver, message }`; los hooks exponen solo el conductor.
const response = (driver: Driver) => ({ driver, message: 'Resultados encontrados' });

describe('useDriver', () => {
  beforeEach(() => {
    getById.mockReset();
  });

  it('pide el conductor por id y desenvuelve la respuesta', async () => {
    getById.mockResolvedValue(response(driverB));

    const { result } = renderHook(() => useDriver('driver-b'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(driverB));
    expect(getById).toHaveBeenCalledWith('driver-b');
  });

  it('no consulta nada mientras no haya id', () => {
    const { result } = renderHook(() => useDriver(undefined), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(getById).not.toHaveBeenCalled();
  });
});

describe('useDriversByIds', () => {
  beforeEach(() => {
    getById.mockReset();
  });

  it('resuelve cada id una sola vez e ignora ids vacíos', async () => {
    getById.mockImplementation((id: string) =>
      Promise.resolve(response(id === driverA.id ? driverA : driverB))
    );

    const { result } = renderHook(() => useDriversByIds([driverA.id, driverB.id, driverA.id, undefined]), {
      wrapper,
    });

    await waitFor(() => expect(result.current.size).toBe(2));
    expect(getById.mock.calls.map(([id]) => id)).toEqual([driverA.id, driverB.id]);
    expect(result.current.get(driverB.id)).toEqual(driverB);
  });
});

describe('useAllDrivers', () => {
  beforeEach(() => {
    list.mockReset();
  });

  it('recorre todas las páginas hasta juntar los conductores de la empresa', async () => {
    list.mockImplementation((_companyId?: string, _search?: string, page?: number) =>
      Promise.resolve({
        items: page === 1 ? [driverA] : [driverB],
        total: 2,
        limit: 100,
        page,
        totalPages: 2,
      })
    );

    const { result } = renderHook(() => useAllDrivers('company-1'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([driverA, driverB]));
    expect(list.mock.calls).toEqual([
      ['company-1', undefined, 1, 100],
      ['company-1', undefined, 2, 100],
    ]);
  });
});
