export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyLogoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
