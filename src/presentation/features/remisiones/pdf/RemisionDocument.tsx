import { Document, Font, Image, Page, PDFViewer, Text, View } from '@react-pdf/renderer';
import type { Client } from '@/src/core/domain/entities/Client';
import type { Company } from '@/src/core/domain/entities/Company';
import type { Driver } from '@/src/core/domain/entities/Driver';
import type { Remision } from '@/src/core/domain/entities/Remision';
import { styles } from './styles';

// Registrar fuentes (opcional, puedes ajustar según tus necesidades)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
  ],
});

interface RemisionDocumentProps {
  remision: Remision;
  company: Company;
  client: Client;
  driver?: Driver;
}

export function RemisionDocument({ remision, company, client, driver }: RemisionDocumentProps) {
  const isPriced = remision?.type === 'priced';

  const formatCurrency = (value: number) => {
    return `$ ${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="h-220 border-2 rounded-lg border-[#7a7d85] p-2">
      <PDFViewer style={styles.content}>
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Encabezado */}
            <View style={styles.header}>
              <View style={styles.companyInfoContainer}>
                {company.logoUrl && <Image src={company.logoUrl} style={styles.companyLogo} />}
                <View style={styles.companyInfo}>
                  <Text style={styles.title}>{company?.name}</Text>
                  <Text style={styles.subtitle}>NIT {company?.nit}</Text>
                  {company?.address && <Text style={styles.subtitle}>{company?.address}</Text>}
                  {company?.phone && <Text style={styles.subtitle}>{company?.phone}</Text>}
                  {company?.email && <Text style={styles.subtitle}>{company?.email}</Text>}
                </View>
              </View>
              <View>
                <Text style={styles.title}>REMISIÓN</Text>
                <Text style={styles.badge}>No. {String(remision?.consecutive).padStart(5, '0')}</Text>
                <Text style={styles.subtitle}>{formatDate(remision?.createdAt)}</Text>
                <Text style={styles.subtitle}>{isPriced ? 'Con precio + IVA' : 'Solo cantidad'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Cliente */}
            <View style={styles.card}>
              <View>
                <Text style={styles.cardTitle}>CLIENTE</Text>
                <Text style={styles.cardText}>{client?.name}</Text>
                <Text style={styles.cardTextMuted}>Doc. {client?.documentId}</Text>
                {(client?.phone || client?.address) && (
                  <Text style={styles.cardTextMuted}>
                    {client?.phone} {client?.phone && client?.address ? '·' : ''} {client?.address}
                  </Text>
                )}
              </View>
              {/* Conductor */}
              {driver && (
                <View>
                  <Text style={styles.cardTitle}>CONDUCTOR</Text>
                  <Text style={styles.cardText}>{driver?.name}</Text>
                  <Text style={styles.cardTextMuted}>Documento: {driver?.documentId}</Text>
                  {driver?.phone && (
                    <Text style={styles.cardTextMuted}>
                      {driver?.phone} Placa: {driver?.vehiclePlate}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Tabla de ítems */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.tableCellDescription]}>DESCRIPCIÓN</Text>
                <Text style={[styles.tableHeaderText, styles.tableCellQty]}>CANT.</Text>
                {isPriced && (
                  <>
                    <Text style={[styles.tableHeaderText, styles.tableCellPrice]}>PRECIO UNIT.</Text>
                    <Text style={[styles.tableHeaderText, styles.tableCellTotal]}>TOTAL</Text>
                  </>
                )}
              </View>
              {remision?.items.map((item, index) => {
                const key = `${item.description}-${item.quantity}-${index}`;
                const rowStyle = [styles.tableRow];
                if (index % 2 === 1) {
                  rowStyle.push(styles.tableRowOdd);
                }
                return (
                  <View key={key} style={rowStyle}>
                    <Text style={[styles.tableCell, styles.tableCellDescription]}>{item.description}</Text>
                    <Text style={[styles.tableCell, styles.tableCellQty]}>{item.quantity}</Text>
                    {isPriced && (
                      <>
                        <Text style={[styles.tableCell, styles.tableCellPrice]}>
                          {formatCurrency(item.unitPrice ?? 0)}
                        </Text>
                        <Text style={[styles.tableCell, styles.tableCellTotal]}>
                          {formatCurrency((item.unitPrice ?? 0) * item.quantity)}
                        </Text>
                      </>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Totales */}
            {isPriced && (
              <View style={styles.totals}>
                <View style={styles.totalsCard}>
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>Subtotal</Text>
                    <Text style={styles.totalsValue}>{formatCurrency(remision.subtotal ?? 0)}</Text>
                  </View>
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>IVA ({remision.ivaPercentage ?? 0}%)</Text>
                    <Text style={styles.totalsValue}>{formatCurrency(remision.ivaValue ?? 0)}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>TOTAL</Text>
                    <Text style={styles.totalsValueBold}>{formatCurrency(remision.total ?? 0)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Notas */}
            {remision?.notes && (
              <View style={styles.notes}>
                <Text style={styles.notesTitle}>NOTAS</Text>
                <Text style={styles.notesText}>{remision.notes}</Text>
              </View>
            )}

            {/* Firmas */}
            <View style={styles.signatures}>
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>Entrega (Conductor)</Text>
              </View>
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>Recibe (Cliente)</Text>
              </View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </div>
  );
}
