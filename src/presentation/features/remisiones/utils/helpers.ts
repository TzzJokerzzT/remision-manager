import type { RemisionFormValues } from '@/src/core/application/dtos/remision.dto';
import { DEFAULT_IVA_PERCENTAGE } from './constant';

export function formatCurrency(value: number) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

export function formatDate(value: string, monthType: 'long' | 'short' = 'long') {
  return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: monthType, year: 'numeric' });
}

/** Ítem nuevo: gravado al 19 % por defecto, y se puede apagar o cambiar por producto. */
export function emptyItem() {
  return {
    description: '',
    quantity: 1,
    unitPrice: 0,
    hasIva: true,
    ivaPercentage: DEFAULT_IVA_PERCENTAGE,
  };
}

export function cleanPayload(values: RemisionFormValues) {
  const isPriced = values.type === 'priced';

  return {
    type: values.type,
    documentType: values.documentType,
    companyId: values.companyId,
    clientId: values.clientId,
    driverId: values.driverId || undefined,
    items: values.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: isPriced ? item.unitPrice : undefined,
      // El IVA es por producto. En quantity_only el DTO del backend igual exige `hasIva`, y
      // con true exigiría una tasa > 0 que en ese tipo no aplica: va en false y sin tasa.
      hasIva: isPriced ? item.hasIva === true : false,
      ivaPercentage: isPriced && item.hasIva === true ? item.ivaPercentage : undefined,
    })),
    hasRetencion: isPriced ? values.hasRetencion : false,
    retencionPercentage: values.retencionPercentage,
    notes: values.notes || undefined,
  };
}
