import type { Remision } from '@/src/core/domain/entities/Remision';
import type {
  CreateRemisionPayload,
  PaginatedRemisionResponse,
  UpdateRemisionPayload,
} from '@/src/core/domain/repositories/IRemisionRepository';
import { httpClient } from '@/src/core/infrastructure/http/httpClient';
import { RemisionRepository } from '@/src/core/infrastructure/repositories/RemisionRepository';

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

const updatePayload: UpdateRemisionPayload = {
  notes: 'Entregado en obra',
};

describe('RemisionRepository', () => {
  const repository = new RemisionRepository();

  describe('list', () => {
    it('envía un objeto params vacío cuando no hay filtros', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list();

      expect(getMock).toHaveBeenCalledWith('/remisiones', { params: {} });
    });

    it('recorta search y los filtros de texto de filters', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list(undefined, '  cemento  ', undefined, undefined, {
        clientName: '  acme  ',
        driverName: '  juan  ',
        type: '  priced  ',
        from: '  2025-01-01  ',
        to: '  2025-01-31  ',
      });

      expect(getMock).toHaveBeenCalledWith('/remisiones', {
        params: {
          search: 'cemento',
          clientName: 'acme',
          driverName: 'juan',
          type: 'priced',
          from: '2025-01-01',
          to: '2025-01-31',
        },
      });
    });

    it('omite los filtros que quedan vacíos tras recortar', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list(undefined, '   ', undefined, undefined, {
        clientName: '   ',
        driverName: '   ',
        type: '   ',
        from: '   ',
        to: '   ',
      });

      expect(getMock).toHaveBeenCalledWith('/remisiones', { params: {} });
    });

    it('incluye companyId, page y limit sin recortar', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list('company-1', undefined, 2, 10);

      expect(getMock).toHaveBeenCalledWith('/remisiones', {
        params: { companyId: 'company-1', page: 2, limit: 10 },
      });
    });

    // TODO(bug): companyId no se recorta; el resto de filtros de texto sí. Si el
    // backend recibe un id con espacios, no lo encontrará.
    it('no recorta companyId', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list('  company-1  ');

      expect(getMock).toHaveBeenCalledWith('/remisiones', {
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
      getMock.mockResolvedValue({ data: { data: remision } });

      await expect(repository.getById('rem-1')).resolves.toEqual(remision);
      expect(getMock).toHaveBeenCalledWith('/remisiones/rem-1');
    });
  });

  describe('create', () => {
    it('envía POST y desenvuelve data.data y data.message', async () => {
      postMock.mockResolvedValue({ data: { data: remision, message: 'Remisión creada' } });

      await expect(repository.create(createPayload)).resolves.toEqual({
        remision,
        message: 'Remisión creada',
      });
      expect(postMock).toHaveBeenCalledWith('/remisiones', createPayload);
    });
  });

  describe('update', () => {
    it('envía PATCH y desenvuelve data.data y data.message', async () => {
      patchMock.mockResolvedValue({ data: { data: remision, message: 'Remisión actualizada' } });

      await expect(repository.update('rem-1', updatePayload)).resolves.toEqual({
        remision,
        message: 'Remisión actualizada',
      });
      expect(patchMock).toHaveBeenCalledWith('/remisiones/rem-1', updatePayload);
    });
  });

  describe('delete', () => {
    it('envía DELETE en la URL correcta y no devuelve nada', async () => {
      deleteMock.mockResolvedValue({ data: {} });

      await expect(repository.delete('rem-1')).resolves.toBeUndefined();
      expect(deleteMock).toHaveBeenCalledWith('/remisiones/rem-1');
    });
  });
});
