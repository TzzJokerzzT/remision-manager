import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CompanyFormValues } from '@/src/core/application/dtos/company.dto';
import { CompanyForm } from '@/src/presentation/features/companies/components/CompanyForm';

jest.mock('@/src/presentation/components/ui/Dropzone', () => ({
  Dropzone: ({ error }: { error?: string }) => <div data-testid="dropzone">{error && <p>{error}</p>}</div>,
}));

function renderForm(
  defaultValues: Partial<CompanyFormValues> = {},
  onSubmit: (values: CompanyFormValues) => void = jest.fn()
) {
  return render(
    <CompanyForm onSubmit={onSubmit} submitLabel="Crear empresa" defaultValues={defaultValues} />
  );
}

describe('CompanyForm', () => {
  it('muestra errores de campos requeridos al enviar vacío', async () => {
    const onSubmit = jest.fn();
    renderForm({}, onSubmit);

    await userEvent.click(screen.getByRole('button', { name: 'Crear empresa' }));

    expect(await screen.findByText('Mínimo 2 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('acepta logoUrl como string vacío exacto', async () => {
    const onSubmit = jest.fn();
    renderForm({ name: 'Acme', nit: '900123456-7', logoUrl: '' }, onSubmit);

    await userEvent.click(screen.getByRole('button', { name: 'Crear empresa' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].logoUrl).toBe('');
  });

  it('rechaza logoUrl inválido y no llama a onSubmit', async () => {
    const onSubmit = jest.fn();
    renderForm({ name: 'Acme', nit: '900123456-7', logoUrl: 'no-es-url' }, onSubmit);

    await userEvent.click(screen.getByRole('button', { name: 'Crear empresa' }));

    expect(await screen.findByText('URL inválida')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('entrega los valores parseados (recortados) a onSubmit', async () => {
    const onSubmit = jest.fn();
    renderForm(
      {
        name: '  Acme S.A.S  ',
        nit: ' 900123456-7 ',
        address: ' Calle 10 # 5-23 ',
        phone: ' 3001234567 ',
        email: ' contacto@empresa.com ',
        logoUrl: 'https://cdn.example.com/logo.png',
      },
      onSubmit
    );

    await userEvent.click(screen.getByRole('button', { name: 'Crear empresa' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'Acme S.A.S',
      nit: '900123456-7',
      address: 'Calle 10 # 5-23',
      phone: '3001234567',
      email: 'contacto@empresa.com',
      logoUrl: 'https://cdn.example.com/logo.png',
    });
  });
});
