'use client';

import { Building2 } from 'lucide-react';
import { useEffect } from 'react';
import { AppSelect } from '@/src/presentation/components/ui/AppSelect';
import { useCompanyStore } from '@/src/presentation/stores/company.store';
import { useCompanies } from '../hooks/useCompanies';

export function CompanySelector() {
  const { data: companies, isLoading } = useCompanies();
  const { selectedCompany, setSelectedCompany } = useCompanyStore();

  // Si la empresa seleccionada fue eliminada o ya no existe, se limpia la selección
  useEffect(() => {
    if (!companies || !selectedCompany) return;
    const stillExists = companies.some((c) => c.id === selectedCompany.id);
    if (!stillExists) setSelectedCompany(null);
  }, [companies, selectedCompany, setSelectedCompany]);

  const options = (companies ?? []).map((c) => ({ id: c.id, label: c.name }));

  return (
    <div className="flex min-w-[200px] items-center gap-2">
      <Building2 className="h-4 w-4 shrink-0 text-foreground/40" />
      <AppSelect
        placeholder={isLoading ? 'Cargando...' : 'Selecciona empresa'}
        options={options}
        selectedKey={selectedCompany?.id ?? null}
        onSelectionChange={(key) => {
          const company = companies?.find((c) => c.id === key) ?? null;
          setSelectedCompany(company);
        }}
        isDisabled={isLoading || options.length === 0}
        fullWidth
      />
    </div>
  );
}
