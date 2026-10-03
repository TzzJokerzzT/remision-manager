import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { computeRemisionTotals } from './remisionTotals';

describe('computeRemisionTotals', () => {
  test('priced with IVA 19 and retencion 2.5', () => {
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

    assert.equal(totals.subtotal, 200);
    assert.equal(totals.ivaValue, 38);
    assert.equal(totals.retencionValue, 5);
    assert.equal(totals.total, 233);
  });

  test('priced with hasRetencion true but no retencionPercentage', () => {
    const totals = computeRemisionTotals([{ quantity: 2, unitPrice: 50 }], 'priced', 19, true);

    assert.equal(totals.subtotal, 100);
    assert.equal(totals.ivaValue, 19);
    assert.equal(totals.retencionValue, undefined);
    assert.equal(totals.total, 119);
  });

  test('priced with hasRetencion false and a stale retencionPercentage', () => {
    const totals = computeRemisionTotals([{ quantity: 2, unitPrice: 50 }], 'priced', 19, false, 2.5);

    assert.equal(totals.subtotal, 100);
    assert.equal(totals.ivaValue, 19);
    assert.equal(totals.retencionValue, undefined);
    assert.equal(totals.total, 119);
  });

  test('quantity_only ignores all pricing fields', () => {
    const totals = computeRemisionTotals([{ quantity: 2, unitPrice: 50 }], 'quantity_only', 19, true, 2.5);

    assert.equal(totals.subtotal, undefined);
    assert.equal(totals.ivaValue, undefined);
    assert.equal(totals.retencionValue, undefined);
    assert.equal(totals.total, undefined);
  });

  test('rounds every value with round2', () => {
    const totals = computeRemisionTotals([{ quantity: 3, unitPrice: 33.33 }], 'priced', 19, true, 2.5);

    assert.equal(totals.subtotal, 99.99);
    assert.equal(totals.ivaValue, 19);
    assert.equal(totals.retencionValue, 2.5);
    assert.equal(totals.total, 116.49);
  });
});
