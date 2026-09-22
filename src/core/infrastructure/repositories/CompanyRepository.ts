import type { Company } from '../../domain/entities/Company';
import type {
  CreateCompanyPayload,
  ICompanyRepository,
  PaginatedCompanyResponse,
  UpdateCompanyPayload,
} from '../../domain/repositories/ICompanyRepository';
import { httpClient } from '../http/httpClient';

export class CompanyRepository implements ICompanyRepository {
  async list(search?: string, page?: number, limit?: number): Promise<PaginatedCompanyResponse> {
    const params: Record<string, string | number> = {};
    if (search?.trim()) params.search = search.trim();
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const { data } = await httpClient.get('/companies', { params });
    return data.data as PaginatedCompanyResponse;
  }

  async getById(id: string) {
    const { data } = await httpClient.get(`/companies/${id}`);
    return data.data as Company;
  }

  async create(payload: CreateCompanyPayload) {
    const { data } = await httpClient.post('/companies', payload);
    return {
      company: data.data as Company,
      message: data.message,
    };
  }

  async update(id: string, payload: UpdateCompanyPayload) {
    const { data } = await httpClient.patch(`/companies/${id}`, payload);
    return {
      company: data.data as Company,
      message: data.message,
    };
  }

  async delete(id: string) {
    await httpClient.delete(`/companies/${id}`);
  }
}
