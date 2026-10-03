import type { Company } from '@/src/core/domain/entities/Company';
import type {
  CreateCompanyPayload,
  PaginatedCompanyResponse,
  UpdateCompanyPayload,
} from '@/src/core/domain/repositories/ICompanyRepository';
import { httpClient } from '@/src/core/infrastructure/http/httpClient';
import { CompanyRepository } from '@/src/core/infrastructure/repositories/CompanyRepository';

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

const company: Company = {
  id: 'company-1',
  name: 'Acme SAS',
  nit: '900123456-1',
  logoUrl: null,
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const paginated: PaginatedCompanyResponse = {
  items: [company],
  total: 1,
  limit: 10,
  page: 1,
  totalPages: 1,
};

const createPayload: CreateCompanyPayload = {
  name: 'Acme SAS',
  nit: '900123456-1',
};

const updatePayload: UpdateCompanyPayload = {
  name: 'Acme Corp',
};

describe('CompanyRepository', () => {
  const repository = new CompanyRepository();

  describe('list', () => {
    it('envía un objeto params vacío cuando no hay filtros', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list();

      expect(getMock).toHaveBeenCalledWith('/companies', { params: {} });
    });

    it('recorta search y pasa page y limit tal cual', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list('  acme  ', 2, 10);

      expect(getMock).toHaveBeenCalledWith('/companies', {
        params: { search: 'acme', page: 2, limit: 10 },
      });
    });

    it('omite search cuando queda vacío tras recortar', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await repository.list('   ');

      expect(getMock).toHaveBeenCalledWith('/companies', { params: {} });
    });

    it('desenvuelve data.data y devuelve la respuesta paginada', async () => {
      getMock.mockResolvedValue({ data: { data: paginated } });

      await expect(repository.list()).resolves.toEqual(paginated);
    });
  });

  describe('getById', () => {
    it('obtiene por id y desenvuelve data.data', async () => {
      getMock.mockResolvedValue({ data: { data: company } });

      await expect(repository.getById('company-1')).resolves.toEqual(company);
      expect(getMock).toHaveBeenCalledWith('/companies/company-1');
    });
  });

  describe('create', () => {
    it('envía POST y desenvuelve data.data y data.message', async () => {
      postMock.mockResolvedValue({ data: { data: company, message: 'Empresa creada' } });

      await expect(repository.create(createPayload)).resolves.toEqual({
        company,
        message: 'Empresa creada',
      });
      expect(postMock).toHaveBeenCalledWith('/companies', createPayload);
    });
  });

  describe('update', () => {
    it('envía PATCH y desenvuelve data.data y data.message', async () => {
      patchMock.mockResolvedValue({ data: { data: company, message: 'Empresa actualizada' } });

      await expect(repository.update('company-1', updatePayload)).resolves.toEqual({
        company,
        message: 'Empresa actualizada',
      });
      expect(patchMock).toHaveBeenCalledWith('/companies/company-1', updatePayload);
    });
  });

  describe('delete', () => {
    it('envía DELETE en la URL correcta y no devuelve nada', async () => {
      deleteMock.mockResolvedValue({ data: {} });

      await expect(repository.delete('company-1')).resolves.toBeUndefined();
      expect(deleteMock).toHaveBeenCalledWith('/companies/company-1');
    });
  });
});
