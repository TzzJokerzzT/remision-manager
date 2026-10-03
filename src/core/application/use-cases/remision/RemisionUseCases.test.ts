import { RemisionUseCases } from '@/src/core/application/use-cases/remision/RemisionUseCases';
import type { Remision } from '@/src/core/domain/entities/Remision';
import type {
  CreateRemisionPayload,
  IRemisionRepository,
  PaginatedRemisionResponse,
  UpdateRemisionPayload,
} from '@/src/core/domain/repositories/IRemisionRepository';

const remision: Remision = {
  id: 'rem-1',
  consecutive: 42,
  type: 'priced',
  documentType: 'remision',
  companyId: 'company-1',
  clientId: 'client-1',
  items: [{ description: 'Cemento 50kg', quantity: 2, unitPrice: 50 }],
  hasRetencion: false,
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const paginated: PaginatedRemisionResponse = {
  items: [remision],
  total: 1,
  limit: 10,
  page: 1,
  totalPages: 1,
};

const createPayload: CreateRemisionPayload = {
  type: 'priced',
  documentType: 'remision',
  companyId: 'company-1',
  clientId: 'client-1',
  items: [{ description: 'Cemento 50kg', quantity: 2, unitPrice: 50 }],
  hasRetencion: false,
};

const updatePayload: UpdateRemisionPayload = { notes: 'Entregado en obra' };

const repo: IRemisionRepository = {
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('RemisionUseCases', () => {
  const useCases = new RemisionUseCases(repo);

  it('list reenvía los argumentos y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.list).mockResolvedValue(paginated);
    const filters = { clientName: 'acme', driverName: 'juan' };

    await expect(useCases.list('company-1', 'cemento', 2, 10, filters)).resolves.toBe(paginated);

    expect(repo.list).toHaveBeenCalledWith('company-1', 'cemento', 2, 10, filters);
  });

  it('getById reenvía el id y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.getById).mockResolvedValue(remision);

    await expect(useCases.getById('rem-1')).resolves.toBe(remision);

    expect(repo.getById).toHaveBeenCalledWith('rem-1');
  });

  it('create reenvía el payload y devuelve el resultado exacto del repositorio', async () => {
    const result = { remision, message: 'Creada' };
    jest.mocked(repo.create).mockResolvedValue(result);

    await expect(useCases.create(createPayload)).resolves.toBe(result);

    expect(repo.create).toHaveBeenCalledWith(createPayload);
  });

  it('update reenvía id y payload y devuelve el resultado exacto del repositorio', async () => {
    const result = { remision, message: 'Actualizada' };
    jest.mocked(repo.update).mockResolvedValue(result);

    await expect(useCases.update('rem-1', updatePayload)).resolves.toBe(result);

    expect(repo.update).toHaveBeenCalledWith('rem-1', updatePayload);
  });

  it('delete reenvía el id y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.delete).mockResolvedValue(undefined);

    await expect(useCases.delete('rem-1')).resolves.toBeUndefined();

    expect(repo.delete).toHaveBeenCalledWith('rem-1');
  });
});
