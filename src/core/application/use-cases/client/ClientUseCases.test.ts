import { ClientUseCases } from '@/src/core/application/use-cases/client/ClientUseCases';
import type { Client } from '@/src/core/domain/entities/Client';
import type {
  CreateClientPayload,
  IClientRepository,
  PaginatedClientResponse,
  UpdateClientPayload,
} from '@/src/core/domain/repositories/IClientRepository';

const client: Client = {
  id: 'client-1',
  name: 'Acme',
  documentId: '900123456',
  companyId: 'company-1',
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const paginated: PaginatedClientResponse = {
  items: [client],
  total: 1,
  limit: 10,
  page: 1,
  totalPages: 1,
};

const createPayload: CreateClientPayload = {
  name: 'Acme',
  documentId: '900123456',
  companyId: 'company-1',
};

const updatePayload: UpdateClientPayload = { name: 'Acme Corp' };

const repo: IClientRepository = {
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ClientUseCases', () => {
  const useCases = new ClientUseCases(repo);

  it('list reenvía los argumentos y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.list).mockResolvedValue(paginated);

    await expect(useCases.list('company-1', 'acme', 2, 10)).resolves.toBe(paginated);

    expect(repo.list).toHaveBeenCalledWith('company-1', 'acme', 2, 10);
  });

  it('getById reenvía el id y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.getById).mockResolvedValue(client);

    await expect(useCases.getById('client-1')).resolves.toBe(client);

    expect(repo.getById).toHaveBeenCalledWith('client-1');
  });

  it('create reenvía el payload y devuelve el resultado exacto del repositorio', async () => {
    const result = { client, message: 'Creado' };
    jest.mocked(repo.create).mockResolvedValue(result);

    await expect(useCases.create(createPayload)).resolves.toBe(result);

    expect(repo.create).toHaveBeenCalledWith(createPayload);
  });

  it('update reenvía id y payload y devuelve el resultado exacto del repositorio', async () => {
    const result = { client, message: 'Actualizado' };
    jest.mocked(repo.update).mockResolvedValue(result);

    await expect(useCases.update('client-1', updatePayload)).resolves.toBe(result);

    expect(repo.update).toHaveBeenCalledWith('client-1', updatePayload);
  });

  it('delete reenvía el id y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.delete).mockResolvedValue(undefined);

    await expect(useCases.delete('client-1')).resolves.toBeUndefined();

    expect(repo.delete).toHaveBeenCalledWith('client-1');
  });
});
