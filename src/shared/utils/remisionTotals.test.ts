import { computeRemisionTotals } from './remisionTotals';

/**
 * Los fixtures de este archivo se copian de los tests del backend
 * (`remisiones-backend/src/domain/services/remisionTotals.test.ts`) a propósito: si el
 * redondeo o el orden de las operaciones se desvía, el preview del formulario mostraría
 * números distintos a los que el backend persiste. Incluye el caso "redondea por ítem y
 * después suma", que es donde un `Math.round` ingenuo daría 0,07 en vez de 0,08.
 */
describe('computeRemisionTotals', () => {
  it('suma cantidad × precio de los ítems con precio', () => {
    const totals = computeRemisionTotals(
      [
        { description: 'A', quantity: 2, unitPrice: 10, hasIva: false },
        { description: 'B', quantity: 3, unitPrice: 5.5, hasIva: false },
      ],
      'priced'
    );

    expect(totals.subtotal).toBe(36.5);
    expect(totals.ivaValue).toBe(0);
    expect(totals.retencionValue).toBeUndefined();
    expect(totals.total).toBe(36.5);
  });

  it('devuelve 0 en todo para una lista vacía', () => {
    const totals = computeRemisionTotals([], 'priced');

    expect(totals.subtotal).toBe(0);
    expect(totals.ivaValue).toBe(0);
    expect(totals.total).toBe(0);
  });

  it('excluye del cálculo los ítems sin precio', () => {
    const totals = computeRemisionTotals(
      [
        { description: 'Con precio', quantity: 2, unitPrice: 100, hasIva: false },
        { description: 'Solo cantidad', quantity: 5, hasIva: false },
      ],
      'priced'
    );

    expect(totals.subtotal).toBe(200);
    expect(totals.total).toBe(200);
  });

  it('el ítem gravado deriva su propio ivaValue', () => {
    const totals = computeRemisionTotals(
      [{ description: 'A', quantity: 2, unitPrice: 100, hasIva: true, ivaPercentage: 19 }],
      'priced'
    );

    expect(totals.items[0].ivaValue).toBe(38);
    expect(totals.ivaValue).toBe(38);
    expect(totals.total).toBe(238);
  });

  it('el ítem exento no produce ivaValue propio', () => {
    const totals = computeRemisionTotals(
      [{ description: 'B', quantity: 2, unitPrice: 100, hasIva: false }],
      'priced'
    );

    expect(totals.items[0].ivaValue).toBeUndefined();
    expect(totals.ivaValue).toBe(0);
    expect(totals.total).toBe(200);
  });

  it('suma solo los ítems gravados (ejemplo del usuario: gravado + exento)', () => {
    const totals = computeRemisionTotals(
      [
        { description: 'Producto gravado', quantity: 1, unitPrice: 100, hasIva: true, ivaPercentage: 19 },
        { description: 'Producto exento', quantity: 1, unitPrice: 100, hasIva: false },
      ],
      'priced'
    );

    expect(totals.subtotal).toBe(200);
    expect(totals.items[0].ivaValue).toBe(19);
    expect(totals.items[1].ivaValue).toBeUndefined();
    expect(totals.ivaValue).toBe(19);
    expect(totals.total).toBe(219);
  });

  it('redondea por ítem y después suma los redondeados', () => {
    const totals = computeRemisionTotals(
      [
        { description: 'A', quantity: 1, unitPrice: 0.19, hasIva: true, ivaPercentage: 19 },
        { description: 'B', quantity: 1, unitPrice: 0.19, hasIva: true, ivaPercentage: 19 },
      ],
      'priced'
    );

    expect(totals.items[0].ivaValue).toBe(0.04);
    expect(totals.items[1].ivaValue).toBe(0.04);
    expect(totals.ivaValue).toBe(0.08);
  });

  it('redondea a 2 decimales con toFixed(2), igual que el backend', () => {
    const totals = computeRemisionTotals(
      [{ description: 'A', quantity: 1, unitPrice: 19.99, hasIva: true, ivaPercentage: 19 }],
      'priced'
    );

    expect(totals.subtotal).toBe(19.99);
    expect(totals.ivaValue).toBe(3.8);
    expect(totals.total).toBe(23.79);
  });

  it('la retención se calcula sobre el subtotal, no sobre el total con IVA', () => {
    const totals = computeRemisionTotals(
      [{ description: 'A', quantity: 2, unitPrice: 100, hasIva: true, ivaPercentage: 19 }],
      'priced',
      true,
      2.5
    );

    expect(totals.subtotal).toBe(200);
    expect(totals.ivaValue).toBe(38);
    expect(totals.retencionValue).toBe(5);
    expect(totals.total).toBe(233);
  });

  it('en quantity_only devuelve todo undefined y no enriquece los ítems', () => {
    const items = [{ description: 'Solo cantidad', quantity: 5, hasIva: true, ivaPercentage: 19 }];
    const totals = computeRemisionTotals(items, 'quantity_only');

    expect(totals.subtotal).toBeUndefined();
    expect(totals.ivaValue).toBeUndefined();
    expect(totals.retencionValue).toBeUndefined();
    expect(totals.total).toBeUndefined();
    expect(totals.items[0].ivaValue).toBeUndefined();
  });

  it('en quantity_only descarta un ivaValue que viniera en el ítem', () => {
    const totals = computeRemisionTotals(
      [{ description: 'Solo cantidad', quantity: 5, hasIva: true, ivaPercentage: 19, ivaValue: 5 }],
      'quantity_only'
    );

    expect(totals.items[0]).not.toHaveProperty('ivaValue');
  });

  /**
   * Diferencia deliberada con el backend: este util alimenta el preview del formulario, donde
   * el usuario puede tener ítems a medio completar. El backend rechaza estos casos con 422;
   * acá se resuelven en silencio para no romper el render, y el schema del formulario es quien
   * los bloquea antes de enviar.
   */
  describe('tolerancia del preview (el backend rechazaría estos casos)', () => {
    it('trata un ítem sin hasIva como exento', () => {
      const totals = computeRemisionTotals([{ description: 'A', quantity: 1, unitPrice: 100 }], 'priced');

      expect(totals.subtotal).toBe(100);
      expect(totals.ivaValue).toBe(0);
      expect(totals.total).toBe(100);
    });

    it('trata un ítem gravado sin tasa como IVA 0', () => {
      const totals = computeRemisionTotals(
        [{ description: 'A', quantity: 1, unitPrice: 100, hasIva: true }],
        'priced'
      );

      expect(totals.ivaValue).toBe(0);
      expect(totals.total).toBe(100);
    });
  });
});
