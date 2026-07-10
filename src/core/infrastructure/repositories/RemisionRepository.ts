import type { Remision } from '../../domain/entities/Remision';
import type {
  CreateRemisionPayload,
  IRemisionRepository,
  UpdateRemisionPayload,
} from '../../domain/repositories/IRemisionRepository';
import { httpClient } from '../http/httpClient';

export class RemisionRepository implements IRemisionRepository {
  async list(companyId?: string, search?: string) {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    if (search?.trim()) params.search = search.trim();
    const { data } = await httpClient.get('/remisiones', { params });
    return data.data as Remision[];
  }

  async getById(id: string) {
    const { data } = await httpClient.get(`/remisiones/${id}`);
    return data.data as Remision;
  }

  async create(payload: CreateRemisionPayload) {
    const { data } = await httpClient.post('/remisiones', payload);
    return {
      remision: data.data as Remision,
      message: data.message as string,
    };
  }

  async update(id: string, payload: UpdateRemisionPayload) {
    const { data } = await httpClient.patch(`/remisiones/${id}`, payload);
    return {
      remision: data.data as Remision,
      message: data.message as string,
    };
  }

  async delete(id: string) {
    await httpClient.delete(`/remisiones/${id}`);
  }
}
