import type { Company } from '../entities/Company';

export interface CreateCompanyPayload {
  name: string;
  nit: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

export interface ICompanyRepository {
  list(search?: string): Promise<Company[]>;
  getById(id: string): Promise<Company>;
  create(payload: CreateCompanyPayload): Promise<{ company: Company; message: string }>;
  update(id: string, payload: UpdateCompanyPayload): Promise<{ company: Company; message: string }>;
  delete(id: string): Promise<void>;
}
