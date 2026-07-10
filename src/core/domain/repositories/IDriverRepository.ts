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
  getById(id: string): Promise<{ driver: Driver; message: string }>;
  create(payload: CreateDriverPayload): Promise<{ driver: Driver; message: string }>;
  update(id: string, payload: UpdateDriverPayload): Promise<{ driver: Driver; message: string }>;
  delete(id: string): Promise<void>;
}
