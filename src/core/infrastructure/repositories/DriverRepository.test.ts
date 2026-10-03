import type { Driver } from '@/src/core/domain/entities/Driver';
import type {
  CreateDriverPayload,
  PaginatedDriverResponse,
  UpdateDriverPayload,
} from '@/src/core/domain/repositories/IDriverRepository';
import { httpClient } from '@/src/core/infrastructure/http/httpClient';
import { DriverRepository } from '@/src/core/infrastructure/repositories/DriverRepository';

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

const driver: Driver = {
  id: 'driver-1',
  name: 'Juan Pérez',
  documentId: '1030000000',
  licenseNumber: 'C1-123',
  companyId: 'company-1',
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const paginated: PaginatedDriverResponse = {
  items: [driver],
  total: 1,
  limit: 10,
  page: 1,
  totalPages: 1,
};

const createPayload: CreateDriverPayload = {
  name: 'Juan Pérez',
  documentId: '1030000000',
  companyId: 'company-1',
};

const updatePayload: UpdateDriverPayload = {
  vehiclePlate: 'ABC-123',
};

describe('DriverRepository', () => {
  const repository = new DriverRepository();

  describe('list', () => {
    it('envía un objeto params vacío cuando no hay filtros', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list();

      expect(getMock).toHaveBeenCalledWith('/drivers', { params: {} });
    });

    it('recorta search y pasa companyId, page y limit tal cual', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list('company-1', '  juan  ', 2, 10);

      expect(getMock).toHaveBeenCalledWith('/drivers', {
        params: { companyId: 'company-1', search: 'juan', page: 2, limit: 10 },
      });
    });

    it('omite search cuando queda vacío tras recortar', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list(undefined, '   ');

      expect(getMock).toHaveBeenCalledWith('/drivers', { params: {} });
    });

    // TODO(bug): companyId no se recorta, a diferencia de search.
    it('no recorta companyId', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list('  company-1  ');

      expect(getMock).toHaveBeenCalledWith('/drivers', {
        params: { companyId: '  company-1  ' },
      });
    });

    it('desenvuelve data.data y devuelve la respuesta paginada', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await expect(repository.list()).resolves.toEqual(paginated);
    });
  });

  describe('getById', () => {
    it('obtiene por id y desenvuelve data.data y data.message', async () => {
      getMock.mockResolvedValue({ data: { data: driver, message: 'ok' } });

      await expect(repository.getById('driver-1')).resolves.toEqual({
        driver,
        message: 'ok',
      });
      expect(getMock).toHaveBeenCalledWith('/drivers/driver-1');
    });
  });

  describe('create', () => {
    it('envía POST y desenvuelve data.data y data.message', async () => {
      postMock.mockResolvedValue({ data: { data: driver, message: 'Conductor creado' } });

      await expect(repository.create(createPayload)).resolves.toEqual({
        driver,
        message: 'Conductor creado',
      });
      expect(postMock).toHaveBeenCalledWith('/drivers', createPayload);
    });
  });

  describe('update', () => {
    it('envía PATCH y desenvuelve data.data y data.message', async () => {
      patchMock.mockResolvedValue({ data: { data: driver, message: 'Conductor actualizado' } });

      await expect(repository.update('driver-1', updatePayload)).resolves.toEqual({
        driver,
        message: 'Conductor actualizado',
      });
      expect(patchMock).toHaveBeenCalledWith('/drivers/driver-1', updatePayload);
    });
  });

  describe('delete', () => {
    it('envía DELETE en la URL correcta y devuelve data.message', async () => {
      deleteMock.mockResolvedValue({ data: { message: 'Eliminado' } });

      // El contrato (IDriverRepository) declara Promise<void>, pero la implementación
      // devuelve data.message; se fija el comportamiento actual.
      await expect(repository.delete('driver-1')).resolves.toBe('Eliminado');
      expect(deleteMock).toHaveBeenCalledWith('/drivers/driver-1');
    });
  });
});
