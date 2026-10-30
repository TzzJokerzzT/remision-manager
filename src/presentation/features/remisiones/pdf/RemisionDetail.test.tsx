import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { Client } from '@/src/core/domain/entities/Client';
import type { Company } from '@/src/core/domain/entities/Company';
import type { Driver } from '@/src/core/domain/entities/Driver';
import type { Remision } from '@/src/core/domain/entities/Remision';
import { useClient } from '@/src/presentation/features/clients/hooks/useClients';
import { useCompanies } from '@/src/presentation/features/companies/hooks/useCompanies';
import { useDriver } from '@/src/presentation/features/drivers/hooks/useDrivers';
import { useRemision } from '../hooks/useRemisiones';
import { RemisionDetail } from './RemisionDetail';

jest.mock('next/dynamic', () => ({ __esModule: true, default: () => () => null }));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children?: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

jest.mock('../hooks/useRemisiones', () => ({ useRemision: jest.fn() }));
jest.mock('@/src/presentation/features/clients/hooks/useClients', () => ({ useClient: jest.fn() }));
jest.mock('@/src/presentation/features/companies/hooks/useCompanies', () => ({ useCompanies: jest.fn() }));
jest.mock('@/src/presentation/features/drivers/hooks/useDrivers', () => ({ useDriver: jest.fn() }));

const useRemisionMock = useRemision as jest.Mock;
const useClientMock = useClient as jest.Mock;
const useCompaniesMock = useCompanies as jest.Mock;
const useDriverMock = useDriver as jest.Mock;

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
  id: 'client-nuevo',
  name: 'Cliente Nuevo',
  documentId: 'cc-99',
  companyId: 'company-1',
  ownerId: 'owner-1',
  createdAt: '2025-02-01T00:00:00Z',
  updatedAt: '2025-02-01T00:00:00Z',
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

const remision: Remision = {
  id: 'rem-1',
  consecutive: 7,
  type: 'priced',
  documentType: 'remision',
  companyId: 'company-1',
  clientId: client.id,
  driverId: driver.id,
  items: [{ description: 'Cemento', quantity: 1, unitPrice: 100, hasIva: true, ivaPercentage: 19 }],
  hasRetencion: false,
  ownerId: 'owner-1',
  createdAt: '2025-02-01T00:00:00Z',
  updatedAt: '2025-02-01T00:00:00Z',
};

describe('RemisionDetail', () => {
  beforeEach(() => {
    useRemisionMock.mockReturnValue({ data: remision, isLoading: false, error: null });
    useCompaniesMock.mockReturnValue({ data: { items: [company] }, isLoading: false });
    useDriverMock.mockReturnValue({ data: driver, isLoading: false });
    useClientMock.mockReturnValue({ data: client, isLoading: false });
  });

  /**
   * El cliente se resuelve por su id (`GET /clients/:id`). Antes se buscaba dentro de la
   * primera página de la lista de clientes, que el backend devuelve ordenada de más viejo a
   * más nuevo: un cliente recién creado caía fuera y el detalle/PDF decía
   * "Cliente no encontrado".
   */
  it('muestra el cliente de la remisión aunque no esté en la primera página de clientes', () => {
    render(<RemisionDetail remisionId={remision.id} />);

    expect(useClientMock).toHaveBeenCalledWith(client.id);
    expect(useDriverMock).toHaveBeenCalledWith(driver.id);
    expect(screen.getByText('Cliente Nuevo')).toBeInTheDocument();
    expect(screen.queryByText('Cliente no encontrado')).not.toBeInTheDocument();
  });
});
