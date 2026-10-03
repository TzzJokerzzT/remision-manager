export type RemisionTypeLike = 'priced' | 'quantity_only';

export interface RemisionTotals {
  subtotal: number | undefined;
  ivaValue: number | undefined;
  retencionValue: number | undefined;
  total: number | undefined;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeRemisionTotals(
  items: { quantity: number; unitPrice?: number }[],
  type: RemisionTypeLike,
  ivaPercentage?: number,
  hasRetencion?: boolean,
  retencionPercentage?: number
): RemisionTotals {
  if (type === 'quantity_only') {
    return {
      subtotal: undefined,
      ivaValue: undefined,
      retencionValue: undefined,
      total: undefined,
    };
  }

  const subtotal = round2(items.reduce((sum, item) => sum + item.quantity * (item.unitPrice ?? 0), 0));

  const iva = ivaPercentage ?? 0;
  const ivaValue = round2((subtotal * iva) / 100);

  const appliesRetencion = hasRetencion === true && retencionPercentage !== undefined;
  const retencionValue = appliesRetencion ? round2((subtotal * retencionPercentage) / 100) : undefined;

  const total = round2(subtotal + ivaValue - (retencionValue ?? 0));

  return { subtotal, ivaValue, retencionValue, total };
}
