import type { Driver } from '../../domain/entities/Driver';
import type {
  CreateDriverPayload,
  IDriverRepository,
  UpdateDriverPayload,
} from '../../domain/repositories/IDriverRepository';
import { httpClient } from '../http/httpClient';

export class DriverRepository implements IDriverRepository {
  async list(companyId?: string, search?: string) {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    if (search?.trim()) params.search = search.trim();
    const { data } = await httpClient.get('/drivers', { params });
    return data.data as Driver[];
  }

  async getById(id: string) {
    const { data } = await httpClient.get(`/drivers/${id}`);
    return data.data as Driver;
  }

  async create(payload: CreateDriverPayload) {
    const { data } = await httpClient.post('/drivers', payload);
    return data.data as Driver;
  }

  async update(id: string, payload: UpdateDriverPayload) {
    const { data } = await httpClient.patch(`/drivers/${id}`, payload);
    return data.data as Driver;
  }

  async delete(id: string) {
    await httpClient.delete(`/drivers/${id}`);
  }
}
