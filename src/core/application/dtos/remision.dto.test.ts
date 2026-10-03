import { remisionSchema } from '@/src/core/application/dtos/remision.dto';

const validPriced = {
  type: 'priced' as const,
  companyId: 'company-1',
  clientId: 'client-1',
  items: [{ description: 'Cemento 50kg', quantity: 2, unitPrice: 50 }],
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
      ivaPercentage: 19,
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
        items: [{ description: 'Arena m3', quantity: 1 }],
        hasRetencion: true,
        retencionPercentage: 2.5,
      })
    ).toContain('hasRetencion');
  });

  it('exige unitPrice en cada ítem cuando la remisión es con precio', () => {
    expect(issuePaths({ ...validPriced, items: [{ description: 'Arena m3', quantity: 1 }] })).toContain(
      'items'
    );
  });

  it('no exige unitPrice en una remisión de solo cantidad', () => {
    const result = remisionSchema.safeParse({
      ...validPriced,
      type: 'quantity_only',
      items: [{ description: 'Arena m3', quantity: 1 }],
    });

    expect(result.success).toBe(true);
  });

  it('rechaza un ítem con cantidad cero o negativa', () => {
    expect(
      issuePaths({ ...validPriced, items: [{ description: 'Arena', quantity: 0, unitPrice: 10 }] })
    ).toContain('items.0.quantity');
  });

  it('rechaza una lista de ítems vacía', () => {
    expect(issuePaths({ ...validPriced, items: [] })).toContain('items');
  });

  it('rechaza porcentajes fuera de rango', () => {
    expect(issuePaths({ ...validPriced, ivaPercentage: 120 })).toContain('ivaPercentage');
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
});
