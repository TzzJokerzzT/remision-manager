import type { Client } from '../../domain/entities/Client';
import type {
  CreateClientPayload,
  IClientRepository,
  PaginatedClientResponse,
  UpdateClientPayload,
} from '../../domain/repositories/IClientRepository';
import { httpClient } from '../http/httpClient';

export class ClientRepository implements IClientRepository {
  async list(companyId?: string, search?: string, page?: number, limit?: number) {
    const params: Record<string, string | number> = {};
    if (companyId) params.companyId = companyId;
    if (search?.trim()) params.search = search.trim();
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const { data } = await httpClient.get('/clients', { params });
    return data.data as PaginatedClientResponse;
  }

  async getById(id: string) {
    const { data } = await httpClient.get(`/clients/${id}`);
    return data.data as Client;
  }

  async create(payload: CreateClientPayload) {
    const { data } = await httpClient.post('/clients', payload);
    return {
      client: data.data as Client,
      message: data.message,
    };
  }

  async update(id: string, payload: UpdateClientPayload) {
    const { data } = await httpClient.patch(`/clients/${id}`, payload);
    return {
      client: data.data as Client,
      message: data.message,
    };
  }

  async delete(id: string) {
    await httpClient.delete(`/clients/${id}`);
  }
}
