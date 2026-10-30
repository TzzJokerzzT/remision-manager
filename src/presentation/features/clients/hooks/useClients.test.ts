import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { clientUseCases } from '@/src/core/di/container';
import type { Client } from '@/src/core/domain/entities/Client';
import { useAllClients, useClient, useClientsByIds } from './useClients';

jest.mock('@/src/core/di/container', () => ({
  clientUseCases: { getById: jest.fn(), list: jest.fn() },
}));

const getById = clientUseCases.getById as unknown as jest.Mock;
const list = clientUseCases.list as unknown as jest.Mock;

function buildClient(id: string, name: string): Client {
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

const clientA = buildClient('client-a', 'Cliente A');
const clientB = buildClient('client-b', 'Cliente B');

describe('useClient', () => {
  beforeEach(() => {
    getById.mockReset();
  });

  it('pide el cliente por id en lugar de depender de una página de la lista', async () => {
    getById.mockResolvedValue(clientB);

    const { result } = renderHook(() => useClient('client-b'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(clientB));
    expect(getById).toHaveBeenCalledWith('client-b');
  });

  it('no consulta nada mientras no haya id', () => {
    const { result } = renderHook(() => useClient(undefined), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(getById).not.toHaveBeenCalled();
  });
});

describe('useClientsByIds', () => {
  beforeEach(() => {
    getById.mockReset();
  });

  it('resuelve cada id una sola vez e ignora ids vacíos', async () => {
    getById.mockImplementation((id: string) => Promise.resolve(id === clientA.id ? clientA : clientB));

    const { result } = renderHook(() => useClientsByIds([clientA.id, clientB.id, clientA.id, undefined]), {
      wrapper,
    });

    await waitFor(() => expect(result.current.size).toBe(2));
    expect(getById.mock.calls.map(([id]) => id)).toEqual([clientA.id, clientB.id]);
    expect(result.current.get(clientB.id)).toEqual(clientB);
  });
});

describe('useAllClients', () => {
  beforeEach(() => {
    list.mockReset();
  });

  it('recorre todas las páginas hasta juntar los clientes de la empresa', async () => {
    list.mockImplementation((_companyId?: string, _search?: string, page?: number) =>
      Promise.resolve({
        items: page === 1 ? [clientA] : [clientB],
        total: 2,
        limit: 100,
        page,
        totalPages: 2,
      })
    );

    const { result } = renderHook(() => useAllClients('company-1'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([clientA, clientB]));
    expect(list.mock.calls).toEqual([
      ['company-1', undefined, 1, 100],
      ['company-1', undefined, 2, 100],
    ]);
  });
});
