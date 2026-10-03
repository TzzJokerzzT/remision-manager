import type { RemisionItem } from '@/src/core/domain/entities/Remision';

export interface LegacyIvaSource {
  subtotal?: number;
  ivaValue?: number;
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

/**
 * Tasa implícita de una remisión anterior al IVA por producto.
 *
 * Antes el IVA era global, así que el documento guardaba un solo `ivaValue` sobre el `subtotal`.
 * Dividiéndolos se recupera la tasa exacta cuando la remisión usó **una sola** tasa, que es el
 * caso normal. Con tasas mezcladas el total guardado no alcanza para reconstruir el detalle, y
 * esta inferencia devuelve un promedio: es una limitación real de los datos, no del cálculo.
 */
function inferUniformIvaRate({ subtotal, ivaValue }: LegacyIvaSource): number {
  if (typeof subtotal !== 'number' || typeof ivaValue !== 'number') return 0;
  if (subtotal <= 0 || ivaValue <= 0) return 0;
  return round2((ivaValue / subtotal) * 100);
}

/** Ítem que ya declara su IVA: la inferencia siempre deja el campo definido. */
export type InferredRemisionItem = RemisionItem & { hasIva: boolean };

/**
 * Completa `hasIva` / `ivaPercentage` / `ivaValue` en los ítems guardados antes de que el IVA
 * fuera por producto.
 *
 * Hace falta por dos motivos: el backend ahora **rechaza** los ítems sin `hasIva` ("Cada item
 * debe incluir hasIva"), así que editar una remisión vieja fallaría con 400; y sin esto el PDF
 * mostraría $0 de IVA por línea mientras el total dice otra cosa.
 *
 * Los ítems que ya declaran `hasIva` no se tocan: la inferencia es solo para el dato faltante.
 */
export function withInferredItemIva(items: RemisionItem[], source: LegacyIvaSource): InferredRemisionItem[] {
  const rate = inferUniformIvaRate(source);

  return items.map((item) => {
    if (item.hasIva !== undefined) return { ...item, hasIva: item.hasIva };

    const { ivaValue: _ivaValue, ...rest } = item;

    if (rate <= 0) return { ...rest, hasIva: false };

    return {
      ...rest,
      hasIva: true,
      ivaPercentage: rate,
      ivaValue: round2(item.quantity * (item.unitPrice ?? 0) * (rate / 100)),
    };
  });
}
