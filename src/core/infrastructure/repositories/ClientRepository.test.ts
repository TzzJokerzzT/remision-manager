import type { Client } from '@/src/core/domain/entities/Client';
import type {
  CreateClientPayload,
  PaginatedClientResponse,
  UpdateClientPayload,
} from '@/src/core/domain/repositories/IClientRepository';
import { httpClient } from '@/src/core/infrastructure/http/httpClient';
import { ClientRepository } from '@/src/core/infrastructure/repositories/ClientRepository';

jest.mock('@/src/core/infrastructure/http/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const getMock = httpClient.get as jest.Mock;
const postMock = httpClient.post as jest.Mock;
const patchMock = httpClient.patch as jest.Mock;
const deleteMock = httpClient.delete as jest.Mock;

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

const updatePayload: UpdateClientPayload = {
  name: 'Acme Corp',
};

describe('ClientRepository', () => {
  const repository = new ClientRepository();

  describe('list', () => {
    it('envía un objeto params vacío cuando no hay filtros', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list();

      expect(getMock).toHaveBeenCalledWith('/clients', { params: {} });
    });

    it('recorta search y pasa companyId, page y limit tal cual', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list('company-1', '  acme  ', 2, 10);

      expect(getMock).toHaveBeenCalledWith('/clients', {
        params: { companyId: 'company-1', search: 'acme', page: 2, limit: 10 },
      });
    });

    it('omite search cuando queda vacío tras recortar', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list(undefined, '   ');

      expect(getMock).toHaveBeenCalledWith('/clients', { params: {} });
    });

    // TODO(bug): companyId no se recorta, a diferencia de search.
    it('no recorta companyId', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list('  company-1  ');

      expect(getMock).toHaveBeenCalledWith('/clients', {
        params: { companyId: '  company-1  ' },
      });
    });

    it('desenvuelve data.data y devuelve la respuesta paginada', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await expect(repository.list()).resolves.toEqual(paginated);
    });
  });

  describe('getById', () => {
    it('obtiene por id y desenvuelve data.data', async () => {
      getMock.mockResolvedValue({ data: { data: client } });

      await expect(repository.getById('client-1')).resolves.toEqual(client);
      expect(getMock).toHaveBeenCalledWith('/clients/client-1');
    });
  });

  describe('create', () => {
    it('envía POST y desenvuelve data.data y data.message', async () => {
      postMock.mockResolvedValue({ data: { data: client, message: 'Cliente creado' } });

      await expect(repository.create(createPayload)).resolves.toEqual({
        client,
        message: 'Cliente creado',
      });
      expect(postMock).toHaveBeenCalledWith('/clients', createPayload);
    });
  });

  describe('update', () => {
    it('envía PATCH y desenvuelve data.data y data.message', async () => {
      patchMock.mockResolvedValue({ data: { data: client, message: 'Cliente actualizado' } });

      await expect(repository.update('client-1', updatePayload)).resolves.toEqual({
        client,
        message: 'Cliente actualizado',
      });
      expect(patchMock).toHaveBeenCalledWith('/clients/client-1', updatePayload);
    });
  });

  describe('delete', () => {
    it('envía DELETE en la URL correcta y no devuelve nada', async () => {
      deleteMock.mockResolvedValue({ data: {} });

      await expect(repository.delete('client-1')).resolves.toBeUndefined();
      expect(deleteMock).toHaveBeenCalledWith('/clients/client-1');
    });
  });
});
