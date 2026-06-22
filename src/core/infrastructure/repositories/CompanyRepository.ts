import type { Company } from '../../domain/entities/Company';
import type {
  CreateCompanyPayload,
  ICompanyRepository,
  UpdateCompanyPayload,
} from '../../domain/repositories/ICompanyRepository';
import { httpClient } from '../http/httpClient';

export class CompanyRepository implements ICompanyRepository {
  async list(search?: string) {
    const params: Record<string, string> = {};
    if (search?.trim()) params.search = search.trim();
    const { data } = await httpClient.get('/companies', { params });
    return data.data as Company[];
  }

  async getById(id: string) {
    const { data } = await httpClient.get(`/companies/${id}`);
    return data.data as Company;
  }

  async create(payload: CreateCompanyPayload) {
    const { data } = await httpClient.post('/companies', payload);
    return data.data as Company;
  }

  async update(id: string, payload: UpdateCompanyPayload) {
    const { data } = await httpClient.patch(`/companies/${id}`, payload);
    return data.data as Company;
  }

  async delete(id: string) {
    await httpClient.delete(`/companies/${id}`);
  }
}
