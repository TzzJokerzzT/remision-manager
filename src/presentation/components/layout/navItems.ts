import { Building2, FileText, LayoutDashboard, Truck, UserRound, Users } from 'lucide-react';

export const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/remisiones', label: 'Remisiones', icon: FileText },
  { href: '/dashboard/companies', label: 'Empresas', icon: Building2 },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users },
  { href: '/dashboard/drivers', label: 'Conductores', icon: Truck },
  { href: '/dashboard/profile', label: 'Mi perfil', icon: UserRound },
] as const;
