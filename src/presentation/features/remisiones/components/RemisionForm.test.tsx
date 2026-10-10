import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RemisionFormValues } from '@/src/core/application/dtos/remision.dto';
import { RemisionForm } from '@/src/presentation/features/remisiones/components/RemisionForm';

jest.mock('@/src/presentation/features/clients/hooks/useClients', () => ({
  useInfiniteClients: jest.fn(() => ({
    data: { pages: [{ items: [{ id: 'client-1', name: 'Cliente Uno' }] }] },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  })),
}));

jest.mock('@/src/presentation/features/drivers/hooks/useDrivers', () => ({
  useDrivers: jest.fn(() => ({
    data: { items: [{ id: 'driver-1', name: 'Conductor Uno' }] },
    isLoading: false,
  })),
}));

/**
 * El componente formatea con `toLocaleString('es-CO', { currency: 'COP' })`, que produce
 * un espacio de no separación (U+00A0) entre `$` y el número. `getByText` con un string no
 * normaliza el matcher (solo el texto del DOM), así que se busca con una regex tolerante al
 * separador y al número de decimales del ICU de cada entorno.
 */
const money = (value: number) => new RegExp(`\\$\\s*${value}(?!\\d)`);

const pricedItems = [{ description: 'Cemento', quantity: 2, unitPrice: 50, hasIva: true, ivaPercentage: 19 }];

/**
 * El `Switch` de HeroUI no asocia el texto visible al `input[role="switch"]` (no expone
 * nombre accesible), así que se ubica el input dentro del contenedor del texto de su label.
 */
function switchFor(text: string): HTMLElement {
  const container = screen.getByText(text).closest('div');
  if (!container) throw new Error(`No se encontró el switch para "${text}"`);
  return within(container as HTMLElement).getByRole('switch');
}

function renderForm(
  defaultValues: Partial<RemisionFormValues> = {},
  onSubmit: (values: RemisionFormValues) => void = jest.fn()
) {
  return render(
    <RemisionForm
      companyId="company-1"
      onSubmit={onSubmit}
      submitLabel="Crear remisión"
      defaultValues={defaultValues}
    />
  );
}

describe('RemisionForm', () => {
  it('recalcula subtotal, IVA y total al editar cantidad, precio e IVA', async () => {
    const user = userEvent.setup();
    renderForm();

    const quantity = screen.getByLabelText('Cantidad');
    await user.clear(quantity);
    await user.type(quantity, '2');

    const unitPrice = screen.getByLabelText('Precio unitario');
    await user.clear(unitPrice);
    await user.type(unitPrice, '50');

    const iva = screen.getByLabelText('IVA (%)');
    await user.clear(iva);
    await user.type(iva, '10');

    // Subtotal: 2 × 50 = 100. IVA al 10 %: 10. Total: 110.
    expect(screen.getByText('IVA')).toBeInTheDocument();
    expect(screen.getByText(money(100))).toBeInTheDocument();
    expect(screen.getByText(money(10))).toBeInTheDocument();
    expect(screen.getByText(money(110))).toBeInTheDocument();
  });

  it('con retención activa muestra el campo y la línea como resta', async () => {
    const user = userEvent.setup();
    renderForm({ items: pricedItems });

    expect(screen.queryByLabelText('Retención (%)')).not.toBeInTheDocument();

    await user.click(switchFor('Retención en la fuente'));

    const retention = screen.getByLabelText('Retención (%)');
    await user.type(retention, '10');

    // Subtotal 100, IVA 19, retención 10 → total 109. La retención se muestra restando.
    expect(screen.getByText('Retención (10%)')).toBeInTheDocument();
    expect(screen.getByText(/-\$\s*10(?!\d)/)).toBeInTheDocument();
    expect(screen.getByText(money(100))).toBeInTheDocument();
    expect(screen.getByText(money(109))).toBeInTheDocument();
  });

  it('sin retención no muestra el campo ni la línea de retención', () => {
    renderForm({ items: pricedItems });

    expect(screen.queryByLabelText('Retención (%)')).not.toBeInTheDocument();
    expect(screen.queryByText(/Retención \(\d/)).not.toBeInTheDocument();
  });

  it('cambiar el tipo a solo cantidad apaga la retención y oculta sus controles', async () => {
    const user = userEvent.setup();
    renderForm({ items: pricedItems });

    await user.click(switchFor('Retención en la fuente'));
    expect(screen.getByLabelText('Retención (%)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /con precio e iva/i }));
    await user.click(await screen.findByText('Solo cantidad'));

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Retención (%)')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Precio unitario')).not.toBeInTheDocument();
    expect(screen.queryByText('Subtotal')).not.toBeInTheDocument();
  });

  it('muestra el error del schema al enviar sin precio unitario (valueAsNumber → NaN)', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn<void, [values: RemisionFormValues]>();
    renderForm(
      {
        clientId: 'client-1',
        driverId: 'driver-1',
        items: [{ description: 'Cemento', quantity: 2, hasIva: true, ivaPercentage: 19 }],
      },
      onSubmit
    );

    await user.click(screen.getByRole('button', { name: 'Crear remisión' }));

    // TODO(bug): el refinamiento "Cada ítem debe tener un precio unitario…" nunca se alcanza:
    // el input con `valueAsNumber` entrega NaN y `z.number()` falla antes que el refinamiento.
    expect(await screen.findByText(/Invalid input: expected number, received NaN/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('entrega los valores parseados con documentType por defecto, hasRetencion booleano e IVA por ítem', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn<void, [values: RemisionFormValues]>();
    renderForm(
      {
        clientId: 'client-1',
        driverId: 'driver-1',
        items: pricedItems,
      },
      onSubmit
    );

    await user.click(screen.getByRole('button', { name: 'Crear remisión' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const values = onSubmit.mock.calls[0][0];
    expect(values).toMatchObject({
      type: 'priced',
      documentType: 'remision',
      companyId: 'company-1',
      clientId: 'client-1',
      driverId: 'driver-1',
      hasRetencion: false,
      items: pricedItems,
    });
    expect(typeof values.hasRetencion).toBe('boolean');
    expect(values.items[0]).toMatchObject({ hasIva: true, ivaPercentage: 19 });
    expect(typeof values.items[0].hasIva).toBe('boolean');
    expect(values).not.toHaveProperty('ivaPercentage');
  });

  it('suma el IVA por ítem: uno gravado y otro exento', async () => {
    renderForm({
      items: [
        { description: 'Gravado', quantity: 1, unitPrice: 100, hasIva: true, ivaPercentage: 19 },
        { description: 'Exento', quantity: 1, unitPrice: 100, hasIva: false },
      ],
    });

    // Subtotal 200, IVA 19 (solo el ítem gravado), total 219.
    expect(screen.getByText(money(200))).toBeInTheDocument();
    expect(screen.getByText(money(19))).toBeInTheDocument();
    expect(screen.getByText(money(219))).toBeInTheDocument();
  });

  it('apagar el IVA de un ítem lo quita del total y oculta su campo; encenderlo lo repone al 19', async () => {
    const user = userEvent.setup();
    renderForm({
      items: [{ description: 'Cemento', quantity: 1, unitPrice: 100, hasIva: true, ivaPercentage: 19 }],
    });

    // Gravaado al 19: subtotal 100, IVA 19, total 119.
    expect(screen.getByLabelText('IVA (%)')).toBeInTheDocument();
    expect(screen.getByText(money(100))).toBeInTheDocument();
    expect(screen.getByText(money(19))).toBeInTheDocument();
    expect(screen.getByText(money(119))).toBeInTheDocument();

    await user.click(switchFor('Este producto tiene IVA'));

    // Exento: el campo desaparece, el IVA vuelve a 0 y subtotal/total coinciden en 100.
    expect(screen.queryByLabelText('IVA (%)')).not.toBeInTheDocument();
    expect(screen.queryByText(money(19))).not.toBeInTheDocument();
    expect(screen.getByText(money(0))).toBeInTheDocument();
    expect(screen.getAllByText(money(100))).toHaveLength(2);

    await user.click(switchFor('Este producto tiene IVA'));

    // Al re-encenderlo el campo vuelve con el 19 por defecto.
    expect(await screen.findByLabelText('IVA (%)')).toHaveValue(19);
    expect(screen.getByText(money(19))).toBeInTheDocument();
    expect(screen.getByText(money(119))).toBeInTheDocument();
  });
});
