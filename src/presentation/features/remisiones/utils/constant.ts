export const typeOptions = [
  { id: 'priced', label: 'Con precio e IVA' },
  { id: 'quantity_only', label: 'Solo cantidad' },
];

export const documentTypeOptions = [
  { id: 'remision', label: 'Remisión' },
  { id: 'orden_compra', label: 'Orden de compra' },
  { id: 'cotizacion', label: 'Cotización' },
];

export const typeOptionsRemisionList = [
  { id: 'priced', name: 'Con precio + IVA' },
  { id: 'quantity_only', name: 'Solo cantidad' },
];

export const DOCUMENT_CONFIG = {
  remision: { label: 'Remisión', prefix: 'REM' },
  orden_compra: { label: 'Orden de compra', prefix: 'OC' },
  cotizacion: { label: 'Cotización', prefix: 'COT' },
} as const;

// El logo se imprime a 5rem (80px): 256px da margen de sobra para impresión.
export const PDF_LOGO = { width: 256 } as const;

/** IVA por defecto de un producto nuevo. Es editable por ítem. */
export const DEFAULT_IVA_PERCENTAGE = 19;
