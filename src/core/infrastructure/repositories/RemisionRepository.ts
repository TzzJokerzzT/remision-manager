import type { Remision } from '../../domain/entities/Remision';
import type {
  CreateRemisionPayload,
  IRemisionRepository,
  PaginatedRemisionResponse,
  UpdateRemisionPayload,
} from '../../domain/repositories/IRemisionRepository';
import { httpClient } from '../http/httpClient';

export class RemisionRepository implements IRemisionRepository {
  async list(
    companyId?: string,
    search?: string,
    page?: number,
    limit?: number,
    filters?: { clientName?: string; driverName?: string; type?: string; from?: string; to?: string }
  ) {
    const params: Record<string, string | number> = {};
    if (companyId) params.companyId = companyId;
    if (search?.trim()) params.search = search.trim();
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (filters?.clientName?.trim()) params.clientName = filters.clientName.trim();
    if (filters?.driverName?.trim()) params.driverName = filters.driverName.trim();
    if (filters?.type?.trim()) params.type = filters.type.trim();
    if (filters?.from?.trim()) params.from = filters.from.trim();
    if (filters?.to?.trim()) params.to = filters.to.trim();
    const { data } = await httpClient.get('/remisiones', { params });
    return data.data as PaginatedRemisionResponse;
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
