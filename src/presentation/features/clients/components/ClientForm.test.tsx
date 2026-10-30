import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Company } from '@/src/core/domain/entities/Company';
import { useCompanies } from '@/src/presentation/features/companies/hooks/useCompanies';
import { ClientForm } from './ClientForm';

jest.mock('@/src/presentation/features/companies/hooks/useCompanies', () => ({
  useCompanies: jest.fn(),
}));

const useCompaniesMock = useCompanies as jest.Mock;

const company: Company = {
  id: 'company-1',
  name: 'Acme',
  nit: '900123456-7',
  logoUrl: null,
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

function renderForm(defaultValues = {}) {
  useCompaniesMock.mockReturnValue({ data: { items: [company] }, isLoading: false });
  render(
    <ClientForm
      defaultValues={{ companyId: company.id, ...defaultValues }}
      submitLabel="Crear cliente"
      onSubmit={jest.fn()}
    />
  );
}

describe('ClientForm', () => {
  beforeEach(() => {
    useCompaniesMock.mockReset();
  });

  /**
   * Igual que en la remisión: el submit queda deshabilitado hasta que el schema pase, y el
   * usuario ve por qué en lugar de un botón muerto sin explicación.
   */
  it('mantiene el submit deshabilitado hasta completar nombre y documento', async () => {
    const user = userEvent.setup();
    renderForm();

    const submit = screen.getByRole('button', { name: 'Crear cliente' });
    expect(submit).toBeDisabled();
    expect(screen.getByText('Completa los campos requeridos para continuar.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Nombre'), 'Cliente Nuevo');
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText('Documento'), '123456');
    expect(submit).toBeEnabled();
    expect(screen.queryByText('Completa los campos requeridos para continuar.')).not.toBeInTheDocument();
  });

  it('con los datos precargados de una edición arranca habilitado', () => {
    renderForm({ name: 'Cliente A', documentId: 'cc-1' });

    expect(screen.getByRole('button', { name: 'Crear cliente' })).toBeEnabled();
  });
});
