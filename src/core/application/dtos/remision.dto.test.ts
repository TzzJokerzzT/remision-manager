import { remisionSchema } from '@/src/core/application/dtos/remision.dto';

const validPriced = {
  type: 'priced' as const,
  companyId: 'company-1',
  clientId: 'client-1',
  items: [{ description: 'Cemento 50kg', quantity: 2, unitPrice: 50, hasIva: true, ivaPercentage: 19 }],
};

/** Devuelve los paths de los issues para poder afirmar sobre la regla que falló. */
function issuePaths(input: unknown): string[] {
  const result = remisionSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('remisionSchema', () => {
  it('aplica los defaults de documentType y hasRetencion', () => {
    const result = remisionSchema.safeParse(validPriced);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.documentType).toBe('remision');
    expect(result.data.hasRetencion).toBe(false);
  });

  it('acepta una remisión con retención completa', () => {
    const result = remisionSchema.safeParse({
      ...validPriced,
      hasRetencion: true,
      retencionPercentage: 2.5,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.retencionPercentage).toBe(2.5);
  });

  it('exige retencionPercentage cuando hasRetencion es true', () => {
    expect(issuePaths({ ...validPriced, hasRetencion: true })).toContain('retencionPercentage');
  });

  it('prohíbe la retención en una remisión de solo cantidad', () => {
    expect(
      issuePaths({
        ...validPriced,
        type: 'quantity_only',
        items: [{ description: 'Arena m3', quantity: 1, hasIva: false }],
        hasRetencion: true,
        retencionPercentage: 2.5,
      })
    ).toContain('hasRetencion');
  });

  it('exige unitPrice en cada ítem cuando la remisión es con precio', () => {
    expect(
      issuePaths({
        ...validPriced,
        items: [{ description: 'Arena m3', quantity: 1, hasIva: true, ivaPercentage: 19 }],
      })
    ).toContain('items');
  });

  it('no exige unitPrice en una remisión de solo cantidad', () => {
    const result = remisionSchema.safeParse({
      ...validPriced,
      type: 'quantity_only',
      items: [{ description: 'Arena m3', quantity: 1, hasIva: false }],
    });

    expect(result.success).toBe(true);
  });

  it('rechaza un ítem con cantidad cero o negativa', () => {
    expect(
      issuePaths({
        ...validPriced,
        items: [{ description: 'Arena', quantity: 0, unitPrice: 10, hasIva: true, ivaPercentage: 19 }],
      })
    ).toContain('items.0.quantity');
  });

  it('rechaza una lista de ítems vacía', () => {
    expect(issuePaths({ ...validPriced, items: [] })).toContain('items');
  });

  it('rechaza porcentajes fuera de rango', () => {
    expect(
      issuePaths({
        ...validPriced,
        items: [{ description: 'Cemento', quantity: 2, unitPrice: 50, hasIva: true, ivaPercentage: 120 }],
      })
    ).toContain('items.0.ivaPercentage');
    expect(issuePaths({ ...validPriced, hasRetencion: true, retencionPercentage: -1 })).toContain(
      'retencionPercentage'
    );
  });

  it('exige empresa y cliente', () => {
    const paths = issuePaths({ ...validPriced, companyId: '', clientId: '' });
    expect(paths).toContain('companyId');
    expect(paths).toContain('clientId');
  });

  it('rechaza un documentType desconocido', () => {
    expect(issuePaths({ ...validPriced, documentType: 'factura' })).toContain('documentType');
  });

  it('acepta notes vacío y lo rechaza si supera los 500 caracteres', () => {
    expect(remisionSchema.safeParse({ ...validPriced, notes: '' }).success).toBe(true);
    expect(issuePaths({ ...validPriced, notes: 'x'.repeat(501) })).toContain('notes');
  });

  // Reglas del IVA por ítem (espejan el backend).
  it('rechaza un ítem exento con tasa positiva', () => {
    expect(
      issuePaths({
        ...validPriced,
        items: [{ description: 'Arena', quantity: 1, unitPrice: 10, hasIva: false, ivaPercentage: 19 }],
      })
    ).toContain('items.0.ivaPercentage');
  });

  it('acepta un ítem exento sin tasa o con tasa 0', () => {
    expect(
      remisionSchema.safeParse({
        ...validPriced,
        items: [{ description: 'Arena', quantity: 1, unitPrice: 10, hasIva: false }],
      }).success
    ).toBe(true);

    expect(
      remisionSchema.safeParse({
        ...validPriced,
        items: [{ description: 'Arena', quantity: 1, unitPrice: 10, hasIva: false, ivaPercentage: 0 }],
      }).success
    ).toBe(true);
  });

  it('rechaza un ítem gravado sin tasa', () => {
    expect(
      issuePaths({
        ...validPriced,
        items: [{ description: 'Arena', quantity: 1, unitPrice: 10, hasIva: true }],
      })
    ).toContain('items.0.ivaPercentage');
  });

  it('exige hasIva también en una remisión de solo cantidad', () => {
    expect(
      issuePaths({
        ...validPriced,
        type: 'quantity_only',
        items: [{ description: 'Arena m3', quantity: 1 }],
      })
    ).toContain('items.0.hasIva');
  });

  /**
   * Ancla el contrato contra el ejemplo concreto que pidió el usuario: un producto gravado al
   * 19 % y uno exento. Se omite `ivaValue` a propósito: es opcional en el backend y, si se
   * enviara, tendría que coincidir al centavo con su cálculo o el request fallaría con 400.
   */
  it('acepta el body de ejemplo con un producto gravado y uno exento', () => {
    const result = remisionSchema.safeParse({
      type: 'priced',
      documentType: 'remision',
      companyId: '6a399e6253da3bf3c3021049',
      clientId: '6a399e6253da3bf3c3021050',
      driverId: '6a399e6253da3bf3c3021051',
      items: [
        { description: 'Producto gravado', quantity: 1, unitPrice: 100, hasIva: true, ivaPercentage: 19 },
        { description: 'Producto exento', quantity: 1, unitPrice: 100, hasIva: false },
      ],
      hasRetencion: false,
      notes: 'Ejemplo con IVA por item',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.items[0]).toMatchObject({ hasIva: true, ivaPercentage: 19 });
    // El exento no lleva tasa: el backend lo rechaza si viene con una positiva.
    expect(result.data.items[1].hasIva).toBe(false);
    expect(result.data.items[1].ivaPercentage).toBeUndefined();
  });
});
