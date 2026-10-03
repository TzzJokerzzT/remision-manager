import { computeRemisionTotals } from './remisionTotals';

describe('computeRemisionTotals', () => {
  it('priced with IVA 19 and retencion 2.5', () => {
    const totals = computeRemisionTotals(
      [
        { quantity: 2, unitPrice: 50 },
        { quantity: 1, unitPrice: 100 },
      ],
      'priced',
      19,
      true,
      2.5
    );

    expect(totals.subtotal).toBe(200);
    expect(totals.ivaValue).toBe(38);
    expect(totals.retencionValue).toBe(5);
    expect(totals.total).toBe(233);
  });

  it('priced with hasRetencion true but no retencionPercentage', () => {
    const totals = computeRemisionTotals([{ quantity: 2, unitPrice: 50 }], 'priced', 19, true);

    expect(totals.subtotal).toBe(100);
    expect(totals.ivaValue).toBe(19);
    expect(totals.retencionValue).toBeUndefined();
    expect(totals.total).toBe(119);
  });

  it('priced with hasRetencion false and a stale retencionPercentage', () => {
    const totals = computeRemisionTotals([{ quantity: 2, unitPrice: 50 }], 'priced', 19, false, 2.5);

    expect(totals.subtotal).toBe(100);
    expect(totals.ivaValue).toBe(19);
    expect(totals.retencionValue).toBeUndefined();
    expect(totals.total).toBe(119);
  });

  it('quantity_only ignores all pricing fields', () => {
    const totals = computeRemisionTotals([{ quantity: 2, unitPrice: 50 }], 'quantity_only', 19, true, 2.5);

    expect(totals.subtotal).toBeUndefined();
    expect(totals.ivaValue).toBeUndefined();
    expect(totals.retencionValue).toBeUndefined();
    expect(totals.total).toBeUndefined();
  });

  it('rounds every value with round2', () => {
    const totals = computeRemisionTotals([{ quantity: 3, unitPrice: 33.33 }], 'priced', 19, true, 2.5);

    expect(totals.subtotal).toBe(99.99);
    expect(totals.ivaValue).toBe(19);
    expect(totals.retencionValue).toBe(2.5);
    expect(totals.total).toBe(116.49);
  });
});
