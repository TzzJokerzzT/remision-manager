import type { Client } from '../entities/Client';

export interface PaginatedClientResponse {
  items: Client[];
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface CreateClientPayload {
  name: string;
  documentId: string;
  companyId: string;
  address?: string;
  phone?: string;
  email?: string;
}

export type UpdateClientPayload = Partial<Omit<CreateClientPayload, 'companyId'>>;

export interface IClientRepository {
  list(companyId?: string, search?: string, page?: number, limit?: number): Promise<PaginatedClientResponse>;
  getById(id: string): Promise<Client>;
  create(payload: CreateClientPayload): Promise<{ client: Client; message: string }>;
  update(id: string, payload: UpdateClientPayload): Promise<{ client: Client; message: string }>;
  delete(id: string): Promise<void>;
}
