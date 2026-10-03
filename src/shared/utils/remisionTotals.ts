import type { RemisionItem, RemisionType } from '@/src/core/domain/entities/Remision';

export interface RemisionTotals {
  subtotal: number | undefined;
  ivaValue: number | undefined;
  retencionValue: number | undefined;
  total: number | undefined;
  /** Los ítems con su `ivaValue` derivado (solo en `priced`), como los devuelve el backend. */
  items: RemisionItem[];
}

/**
 * Mismo redondeo que el backend: `Number(value.toFixed(2))`, **no** `Math.round`.
 * No son equivalentes en todos los casos, y el preview del formulario tiene que mostrar
 * exactamente los números que el backend va a persistir.
 */
function round2(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Totales de una remisión, con el IVA **por ítem**.
 *
 * Espeja `computeRemisionTotals` del backend, incluido el orden de las operaciones: se redondea
 * el IVA de cada ítem y recién después se suman los redondeados (dos ítems de 1 × 0,19 al 19 %
 * dan 0,04 cada uno y 0,08 en total, no 0,07).
 *
 * Diferencia deliberada con el backend: allá un ítem `priced` sin `hasIva`, o gravado sin tasa,
 * lanza un error 422. Acá se resuelven en silencio —sin `hasIva` se trata como exento y sin tasa
 * como IVA 0— porque este util alimenta el preview mientras el usuario todavía está completando
 * los ítems. Quien bloquea esos casos antes de enviar es el schema del formulario.
 */
export function computeRemisionTotals(
  items: RemisionItem[],
  type: RemisionType,
  hasRetencion = false,
  retencionPercentage?: number
): RemisionTotals {
  if (type === 'quantity_only') {
    // Un valor derivado no debe sobrevivir acá: quantity_only no produce IVA. `hasIva` y
    // `ivaPercentage` se conservan para poder reutilizar las tasas si se vuelve a "priced".
    return {
      subtotal: undefined,
      ivaValue: undefined,
      retencionValue: undefined,
      total: undefined,
      items: items.map(({ ivaValue: _ivaValue, ...rest }) => rest),
    };
  }

  const subtotal = items.reduce((acc, item) => acc + item.quantity * (item.unitPrice ?? 0), 0);

  let ivaValue = 0;
  const enrichedItems = items.map((item) => {
    if (item.hasIva === true) {
      const rate = item.ivaPercentage ?? 0;
      const perItemIva = round2(item.quantity * (item.unitPrice ?? 0) * (rate / 100));
      ivaValue += perItemIva;
      return { ...item, ivaValue: perItemIva };
    }

    const { ivaValue: _ivaValue, ...rest } = item;
    return rest;
  });

  ivaValue = round2(ivaValue);

  let retencionValue: number | undefined;
  if (hasRetencion && retencionPercentage !== undefined) {
    retencionValue = round2(subtotal * (retencionPercentage / 100));
  }

  return {
    subtotal: round2(subtotal),
    ivaValue,
    retencionValue,
    total: round2(subtotal + ivaValue - (retencionValue ?? 0)),
    items: enrichedItems,
  };
}
