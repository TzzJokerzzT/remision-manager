import type { Remision } from '../../domain/entities/Remision';
import type {
  CreateRemisionPayload,
  IRemisionRepository,
  UpdateRemisionPayload,
} from '../../domain/repositories/IRemisionRepository';
import { httpClient } from '../http/httpClient';

export class RemisionRepository implements IRemisionRepository {
  async list(companyId?: string) {
    const { data } = await httpClient.get('/remisiones', { params: companyId ? { companyId } : undefined });
    return data.data as Remision[];
  }

  async getById(id: string) {
    const { data } = await httpClient.get(`/remisiones/${id}`);
    return data.data as Remision;
  }

  async create(payload: CreateRemisionPayload) {
    const { data } = await httpClient.post('/remisiones', payload);
    return data.data as Remision;
  }

  async update(id: string, payload: UpdateRemisionPayload) {
    const { data } = await httpClient.patch(`/remisiones/${id}`, payload);
    return data.data as Remision;
  }

  async delete(id: string) {
    await httpClient.delete(`/remisiones/${id}`);
  }
}
