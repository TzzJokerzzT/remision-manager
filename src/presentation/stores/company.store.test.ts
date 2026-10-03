import type { Company } from '@/src/core/domain/entities/Company';
import { useCompanyStore } from '@/src/presentation/stores/company.store';

const company: Company = {
  id: 'company-1',
  name: 'Transportes XYZ',
  nit: '900123456',
  logoUrl: null,
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('useCompanyStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useCompanyStore.setState({ selectedCompany: null });
  });

  it('inicia sin empresa seleccionada', () => {
    expect(useCompanyStore.getState().selectedCompany).toBeNull();
  });

  it('guarda la empresa seleccionada', () => {
    useCompanyStore.getState().setSelectedCompany(company);

    expect(useCompanyStore.getState().selectedCompany).toEqual(company);
  });

  it('limpia la selección al pasar null', () => {
    useCompanyStore.getState().setSelectedCompany(company);
    useCompanyStore.getState().setSelectedCompany(null);

    expect(useCompanyStore.getState().selectedCompany).toBeNull();
  });

  it('persiste la selección en localStorage', () => {
    useCompanyStore.getState().setSelectedCompany(company);

    const stored = localStorage.getItem('remisiones-selected-company');
    expect(stored).not.toBeNull();
    if (stored === null) return;
    expect(JSON.parse(stored).state.selectedCompany).toEqual(company);
  });
});
