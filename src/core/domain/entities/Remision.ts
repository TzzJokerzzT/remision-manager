export type RemisionType = 'priced' | 'quantity_only';

export type DocumentType = 'remision' | 'orden_compra' | 'cotizacion';

export interface RemisionItem {
  description: string;
  quantity: number;
  unitPrice?: number;
  /** El IVA es por producto: si está gravado y con qué tasa. `ivaValue` lo deriva el backend. */
  hasIva?: boolean;
  ivaPercentage?: number;
  ivaValue?: number;
}

export interface Remision {
  id: string;
  consecutive: number;
  type: RemisionType;
  documentType: DocumentType;
  companyId: string;
  clientId: string;
  driverId?: string;
  items: RemisionItem[];
  subtotal?: number;
  // `ivaValue` es la suma de los IVA por ítem. Ya no hay `ivaPercentage` a nivel de remisión:
  // la tasa vive en cada producto.
  ivaValue?: number;
  hasRetencion: boolean;
  retencionPercentage?: number;
  retencionValue?: number;
  total?: number;
  notes?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
