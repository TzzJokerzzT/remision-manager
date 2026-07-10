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
    return {
      driver: data.data as Driver,
      message: data.message as string,
    };
  }

  async create(payload: CreateDriverPayload) {
    const { data } = await httpClient.post('/drivers', payload);
    return {
      driver: data.data as Driver,
      message: data.message as string,
    };
  }

  async update(id: string, payload: UpdateDriverPayload) {
    const { data } = await httpClient.patch(`/drivers/${id}`, payload);
    return {
      driver: data.data as Driver,
      message: data.message as string,
    };
  }

  async delete(id: string) {
    const { data } = await httpClient.delete(`/drivers/${id}`);
    return data.message;
  }
}
