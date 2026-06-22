import type { Client } from '../../domain/entities/Client';
import type {
  CreateClientPayload,
  IClientRepository,
  UpdateClientPayload,
} from '../../domain/repositories/IClientRepository';
import { httpClient } from '../http/httpClient';

export class ClientRepository implements IClientRepository {
  async list(companyId?: string, search?: string) {
    const params: Record<string, string> = {};
    if (companyId) params.companyId = companyId;
    if (search?.trim()) params.search = search.trim();
    const { data } = await httpClient.get('/clients', { params });
    return data.data as Client[];
  }

  async getById(id: string) {
    const { data } = await httpClient.get(`/clients/${id}`);
    return data.data as Client;
  }

  async create(payload: CreateClientPayload) {
    const { data } = await httpClient.post('/clients', payload);
    return data.data as Client;
  }

  async update(id: string, payload: UpdateClientPayload) {
    const { data } = await httpClient.patch(`/clients/${id}`, payload);
    return data.data as Client;
  }

  async delete(id: string) {
    await httpClient.delete(`/clients/${id}`);
  }
}
