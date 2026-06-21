import type { Client } from '../entities/Client';

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
  list(companyId?: string): Promise<Client[]>;
  getById(id: string): Promise<Client>;
  create(payload: CreateClientPayload): Promise<Client>;
  update(id: string, payload: UpdateClientPayload): Promise<Client>;
  delete(id: string): Promise<void>;
}
