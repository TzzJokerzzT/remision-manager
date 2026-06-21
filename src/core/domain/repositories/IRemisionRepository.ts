import type { Remision, RemisionItem, RemisionType } from '../entities/Remision';

export interface CreateRemisionPayload {
  type: RemisionType;
  companyId: string;
  clientId: string;
  driverId: string;
  items: RemisionItem[];
  ivaPercentage?: number;
  notes?: string;
}

export interface UpdateRemisionPayload {
  items?: RemisionItem[];
  ivaPercentage?: number;
  notes?: string;
  clientId?: string;
  driverId?: string;
}

export interface IRemisionRepository {
  list(companyId?: string): Promise<Remision[]>;
  getById(id: string): Promise<Remision>;
  create(payload: CreateRemisionPayload): Promise<Remision>;
  update(id: string, payload: UpdateRemisionPayload): Promise<Remision>;
  delete(id: string): Promise<void>;
}
