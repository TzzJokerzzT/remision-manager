import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  content: {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem',
  },
  companyLogo: {
    width: '5rem',
    height: '5rem',
    borderRadius: '0.2rem',
  },
  companyInfoContainer: {
    flexDirection: 'row',
  },
  companyInfo: {
    flexDirection: 'column',
    marginLeft: '1rem',
  },
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1557BC', // Azul similar al de generateRemisionPdf.ts
  },
  subtitle: {
    fontSize: 10,
    color: '#7A7D85', // Color muted
  },
  badge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1557BC',
    backgroundColor: '#EDF5FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  cardContainer: {},
  card: {
    backgroundColor: '#F7F7F8',
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#A0A3B0', // Color subtle
    marginBottom: 5,
  },
  cardText: {
    fontSize: 11,
    marginBottom: 4,
  },
  cardTextMuted: {
    fontSize: 9,
    color: '#7A7D85', // Color muted
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    backgroundColor: '#1A1B1F', // Color INK de generateRemisionPdf.ts
    color: '#FFFFFF',
    padding: 8,
    flexDirection: 'row',
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E5E8', // Color LINE
  },
  tableRowOdd: {
    backgroundColor: '#F9F9FA', // Color ZEBRA
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E5E8',
  },
  tableCell: {
    fontSize: 10,
  },
  /**
   * La descripción es la única columna elástica: se queda con el espacio que dejan las
   * numéricas, que van a ancho fijo. Antes tenía un 50 % fijo y los anchos sumaban 110 %
   * (50 + 15 + 20 + 10 + 15), así que el layout comprimía las columnas y el importe de IVA
   * —la más angosta, 10 %— terminaba partido en dos líneas.
   */
  tableCellDescription: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  tableCellQty: {
    width: '8%',
    textAlign: 'right',
    // Las numéricas no se comprimen: si la descripción es larga, cede ella.
    flexShrink: 0,
  },
  tableCellPrice: {
    width: '18%',
    textAlign: 'right',
    flexShrink: 0,
  },
  tableCellIva: {
    width: '16%',
    textAlign: 'right',
    flexShrink: 0,
  },
  tableCellTotal: {
    width: '18%',
    textAlign: 'right',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  totals: {
    width: '40%',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  totalsCard: {
    backgroundColor: '#F7F7F8',
    padding: 12,
    borderRadius: 4,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#7A7D85', // Color muted
  },
  totalsValue: {
    fontSize: 10,
  },
  totalsValueBold: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1557BC', // Azul similar al de generateRemisionPdf.ts
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E4E5E8', // Color LINE
    marginVertical: 10,
  },
  notes: {
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#A0A3B0', // Color subtle
    marginBottom: 5,
  },
  notesText: {
    fontSize: 10,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  signature: {
    width: '40%',
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E5E8', // Color LINE
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 9,
    color: '#7A7D85', // Color muted
  },
});
