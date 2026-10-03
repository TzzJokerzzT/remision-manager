import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import type { Client } from '@/src/core/domain/entities/Client';
import type { Company } from '@/src/core/domain/entities/Company';
import type { Driver } from '@/src/core/domain/entities/Driver';
import type { Remision } from '@/src/core/domain/entities/Remision';
import { useClients } from '@/src/presentation/features/clients/hooks/useClients';
import { useDrivers } from '@/src/presentation/features/drivers/hooks/useDrivers';
import { RemisionList } from '@/src/presentation/features/remisiones/components/RemisionList';
import {
  useCreateRemision,
  useDeleteRemision,
  useRemisiones,
  useUpdateRemision,
} from '@/src/presentation/features/remisiones/hooks/useRemisiones';
import { useCompanyStore } from '@/src/presentation/stores/company.store';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children?: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

jest.mock('@/src/presentation/features/remisiones/hooks/useRemisiones', () => ({
  useRemisiones: jest.fn(),
  useCreateRemision: jest.fn(),
  useUpdateRemision: jest.fn(),
  useDeleteRemision: jest.fn(),
}));

jest.mock('@/src/presentation/stores/company.store', () => ({
  useCompanyStore: jest.fn(),
}));

jest.mock('@/src/presentation/features/clients/hooks/useClients', () => ({
  useClients: jest.fn(),
}));

jest.mock('@/src/presentation/features/drivers/hooks/useDrivers', () => ({
  useDrivers: jest.fn(),
}));

const useRemisionesMock = useRemisiones as jest.Mock;
const useCreateRemisionMock = useCreateRemision as jest.Mock;
const useUpdateRemisionMock = useUpdateRemision as jest.Mock;
const useDeleteRemisionMock = useDeleteRemision as jest.Mock;
const useCompanyStoreMock = useCompanyStore as unknown as jest.Mock;
const useClientsMock = useClients as jest.Mock;
const useDriversMock = useDrivers as jest.Mock;

const company: Company = {
  id: 'company-1',
  name: 'Acme',
  nit: '900123456-7',
  logoUrl: null,
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const client: Client = {
  id: 'client-1',
  name: 'Cliente A',
  documentId: 'cc-1',
  companyId: 'company-1',
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const driver: Driver = {
  id: 'driver-1',
  name: 'Conductor A',
  documentId: 'cc-2',
  companyId: 'company-1',
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

// Caso clave: la retención está apagada pero el backend guardó un porcentaje previo.
const remision: Remision = {
  id: 'rem-1',
  consecutive: 42,
  type: 'priced',
  documentType: 'remision',
  companyId: 'company-1',
  clientId: 'client-1',
  driverId: 'driver-1',
  items: [{ description: 'Cemento', quantity: 2, unitPrice: 50 }],
  ivaPercentage: 19,
  hasRetencion: false,
  retencionPercentage: 10,
  total: 119,
  notes: 'nota',
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

function renderList({ items = [remision], totalPages = 1 } = {}) {
  useCompanyStoreMock.mockReturnValue({ selectedCompany: company });
  useClientsMock.mockReturnValue({ data: { items: [client] }, isLoading: false });
  useDriversMock.mockReturnValue({ data: { items: [driver] }, isLoading: false });
  useRemisionesMock.mockReturnValue({
    data: { items, total: items.length, limit: 10, page: 1, totalPages },
    isLoading: false,
  });

  const createMutate = jest.fn();
  const updateMutate = jest.fn();
  const deleteMutate = jest.fn();
  useCreateRemisionMock.mockReturnValue({ mutate: createMutate, isPending: false, error: null });
  useUpdateRemisionMock.mockReturnValue({ mutate: updateMutate, isPending: false, error: null });
  useDeleteRemisionMock.mockReturnValue({ mutate: deleteMutate, isPending: false, error: null });

  render(<RemisionList />);
  return { createMutate, updateMutate, deleteMutate };
}

describe('RemisionList', () => {
  beforeEach(() => {
    useRemisionesMock.mockReset();
    useCreateRemisionMock.mockReset();
    useUpdateRemisionMock.mockReset();
    useDeleteRemisionMock.mockReset();
    useCompanyStoreMock.mockReset();
    useClientsMock.mockReset();
    useDriversMock.mockReset();
  });

  it('al editar envía un update que conserva type y sigue mandando retencionPercentage', async () => {
    const { createMutate, updateMutate } = renderList();

    await userEvent.click(screen.getByRole('button', { name: 'Editar remisión' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Editar remisión #42')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));

    expect(updateMutate).toHaveBeenCalledTimes(1);
    const { id, payload } = updateMutate.mock.calls[0][0];
    expect(id).toBe('rem-1');
    expect(payload).toMatchObject({
      type: 'priced',
      documentType: 'remision',
      hasRetencion: false,
      // Intencional, no un bug: el backend `$unset`ea `retencionValue` al apagar la retención
      // pero CONSERVA `retencionPercentage` como valor de configuración, para poder
      // re-encenderla sin volver a tipear el porcentaje. Por eso el porcentaje se sigue
      // enviando aunque `hasRetencion` sea false. Si lo "arreglás" omitiéndolo, se pierde
      // esa configuración.
      retencionPercentage: 10,
    });
    expect(payload).not.toHaveProperty('companyId');
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('crea una remisión enviando documentType y hasRetencion', async () => {
    const { createMutate, updateMutate } = renderList();

    await userEvent.click(screen.getByRole('button', { name: 'Nueva remisión' }));

    const dialog = screen.getByRole('dialog');

    // Selecciona el cliente abriendo el AppSelect y eligiendo la opción.
    const clientField = within(dialog).getByText('Cliente').closest('div') as HTMLElement;
    await userEvent.click(within(clientField).getByRole('button'));
    await userEvent.click(within(dialog).getByText('Cliente A'));

    await userEvent.type(within(dialog).getByLabelText('Descripción'), 'Cemento');
    const quantity = within(dialog).getByLabelText('Cantidad');
    await userEvent.clear(quantity);
    await userEvent.type(quantity, '2');
    const unitPrice = within(dialog).getByLabelText('Precio unitario');
    await userEvent.clear(unitPrice);
    await userEvent.type(unitPrice, '50');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear remisión' }));

    expect(createMutate).toHaveBeenCalledTimes(1);
    const payload = createMutate.mock.calls[0][0];
    expect(payload).toMatchObject({
      type: 'priced',
      documentType: 'remision',
      hasRetencion: false,
      clientId: 'client-1',
      items: [{ description: 'Cemento', quantity: 2, unitPrice: 50 }],
    });
    expect(updateMutate).not.toHaveBeenCalled();
  });

  it('la paginación dispara la consulta con la página nueva', async () => {
    renderList({ totalPages: 2 });

    await userEvent.click(screen.getByRole('button', { name: '2' }));

    expect(useRemisionesMock).toHaveBeenLastCalledWith('company-1', undefined, 2, 10, expect.anything());
  });

  it('la búsqueda dispara la consulta con el término escrito', async () => {
    renderList();

    await userEvent.type(screen.getByPlaceholderText('Buscar remisiones...'), 'cemento');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(useRemisionesMock).toHaveBeenCalledWith('company-1', 'cemento', 1, 10, expect.anything());
  });
});
