import type { Driver } from '../entities/Driver';

export interface CreateDriverPayload {
  name: string;
  documentId: string;
  companyId: string;
  licenseNumber?: string;
  phone?: string;
  vehiclePlate?: string;
}

export type UpdateDriverPayload = Partial<Omit<CreateDriverPayload, 'companyId'>>;

export interface IDriverRepository {
  list(companyId?: string, search?: string): Promise<Driver[]>;
  getById(id: string): Promise<Driver>;
  create(payload: CreateDriverPayload): Promise<Driver>;
  update(id: string, payload: UpdateDriverPayload): Promise<Driver>;
  delete(id: string): Promise<void>;
}
