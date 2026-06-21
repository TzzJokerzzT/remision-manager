import { PDFDocument, type PDFFont, type PDFPage, rgb, StandardFonts } from 'pdf-lib';
import type { Client } from '@/src/core/domain/entities/Client';
import type { Company } from '@/src/core/domain/entities/Company';
import type { Driver } from '@/src/core/domain/entities/Driver';
import type { Remision } from '@/src/core/domain/entities/Remision';

const PAGE_WIDTH = 595.28; // A4 en puntos
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const INK = rgb(0.09, 0.09, 0.12);
const MUTED = rgb(0.45, 0.45, 0.5);
const LINE = rgb(0.85, 0.85, 0.88);
const ACCENT = rgb(0.13, 0.36, 0.93);

function formatCurrency(value: number) {
  return `$ ${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
}

interface BuildRemisionPdfParams {
  remision: Remision;
  company: Company;
  client: Client;
  driver: Driver;
}

export async function generateRemisionPdf({
  remision,
  company,
  client,
  driver,
}: BuildRemisionPdfParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const isPriced = remision.type === 'priced';

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPage() {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function ensureSpace(minSpace: number) {
    if (y - minSpace < MARGIN) newPage();
  }

  function text(
    value: string,
    x: number,
    yPos: number,
    options: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb> } = {}
  ) {
    page.drawText(value, {
      x,
      y: yPos,
      size: options.size ?? 10,
      font: options.font ?? fontRegular,
      color: options.color ?? INK,
    });
  }

  function hLine(yPos: number, color = LINE, thickness = 1) {
    page.drawLine({
      start: { x: MARGIN, y: yPos },
      end: { x: PAGE_WIDTH - MARGIN, y: yPos },
      thickness,
      color,
    });
  }

  // --- Encabezado: empresa ---
  text(company.name, MARGIN, y, { font: fontBold, size: 16 });
  y -= 16;
  text(`NIT ${company.nit}`, MARGIN, y, { size: 9, color: MUTED });
  y -= 12;
  const contactLine = [company.address, company.phone, company.email].filter(Boolean).join('  ·  ');
  if (contactLine) {
    text(contactLine, MARGIN, y, { size: 9, color: MUTED });
    y -= 12;
  }

  // --- Título y consecutivo (alineado a la derecha) ---
  const titleY = PAGE_HEIGHT - MARGIN;
  const title = 'REMISIÓN';
  const titleWidth = fontBold.widthOfTextAtSize(title, 18);
  text(title, PAGE_WIDTH - MARGIN - titleWidth, titleY, { font: fontBold, size: 18, color: ACCENT });
  const consecutiveText = `No. ${String(remision.consecutive).padStart(5, '0')}`;
  const consecutiveWidth = fontBold.widthOfTextAtSize(consecutiveText, 11);
  text(consecutiveText, PAGE_WIDTH - MARGIN - consecutiveWidth, titleY - 20, { font: fontBold, size: 11 });
  const dateText = formatDate(remision.createdAt);
  const dateWidth = fontRegular.widthOfTextAtSize(dateText, 9);
  text(dateText, PAGE_WIDTH - MARGIN - dateWidth, titleY - 34, { size: 9, color: MUTED });

  y -= 10;
  hLine(y);
  y -= 24;

  // --- Cliente / Conductor ---
  const colWidth = CONTENT_WIDTH / 2;

  text('CLIENTE', MARGIN, y, { font: fontBold, size: 9, color: MUTED });
  text('CONDUCTOR', MARGIN + colWidth, y, { font: fontBold, size: 9, color: MUTED });
  y -= 14;

  text(client.name, MARGIN, y, { font: fontBold, size: 11 });
  text(driver.name, MARGIN + colWidth, y, { font: fontBold, size: 11 });
  y -= 14;

  text(`Documento: ${client.documentId}`, MARGIN, y, { size: 9, color: MUTED });
  text(`Documento: ${driver.documentId}`, MARGIN + colWidth, y, { size: 9, color: MUTED });
  y -= 12;

  if (client.phone || client.address) {
    text([client.phone, client.address].filter(Boolean).join(' · '), MARGIN, y, { size: 9, color: MUTED });
  }
  if (driver.phone || driver.vehiclePlate) {
    text(
      [driver.phone, driver.vehiclePlate ? `Placa ${driver.vehiclePlate}` : null].filter(Boolean).join(' · '),
      MARGIN + colWidth,
      y,
      { size: 9, color: MUTED }
    );
  }
  y -= 26;
  hLine(y);
  y -= 20;

  // --- Tabla de ítems ---
  const colDescX = MARGIN;
  const colQtyX = MARGIN + CONTENT_WIDTH * 0.55;
  const colPriceX = MARGIN + CONTENT_WIDTH * 0.72;
  const colTotalX = MARGIN + CONTENT_WIDTH * 0.86;

  function drawTableHeader() {
    text('DESCRIPCIÓN', colDescX, y, { font: fontBold, size: 9, color: MUTED });
    text('CANT.', colQtyX, y, { font: fontBold, size: 9, color: MUTED });
    if (isPriced) {
      text('PRECIO UNIT.', colPriceX, y, { font: fontBold, size: 9, color: MUTED });
      text('TOTAL', colTotalX, y, { font: fontBold, size: 9, color: MUTED });
    }
    y -= 8;
    hLine(y);
    y -= 16;
  }

  drawTableHeader();

  for (const item of remision.items) {
    ensureSpace(40);
    if (y === PAGE_HEIGHT - MARGIN) drawTableHeader(); // si saltó de página, redibuja encabezado

    const lineTotal = (item.unitPrice ?? 0) * item.quantity;
    text(item.description, colDescX, y, { size: 10 });
    text(String(item.quantity), colQtyX, y, { size: 10 });
    if (isPriced) {
      text(formatCurrency(item.unitPrice ?? 0), colPriceX, y, { size: 10 });
      text(formatCurrency(lineTotal), colTotalX, y, { size: 10 });
    }
    y -= 18;
  }

  y -= 6;
  hLine(y);
  y -= 24;

  // --- Totales ---
  if (isPriced) {
    ensureSpace(80);
    const totalsX = colPriceX;
    const valuesX = colTotalX;

    text('Subtotal', totalsX, y, { size: 10, color: MUTED });
    text(formatCurrency(remision.subtotal ?? 0), valuesX, y, { size: 10 });
    y -= 16;

    text(`IVA (${remision.ivaPercentage ?? 0}%)`, totalsX, y, { size: 10, color: MUTED });
    text(formatCurrency(remision.ivaValue ?? 0), valuesX, y, { size: 10 });
    y -= 16;

    hLine(y, LINE, 1);
    y -= 16;

    text('TOTAL', totalsX, y, { font: fontBold, size: 12 });
    text(formatCurrency(remision.total ?? 0), valuesX, y, { font: fontBold, size: 12, color: ACCENT });
    y -= 28;
  }

  // --- Notas ---
  if (remision.notes) {
    ensureSpace(50);
    text('NOTAS', MARGIN, y, { font: fontBold, size: 9, color: MUTED });
    y -= 14;
    text(remision.notes, MARGIN, y, { size: 9.5 });
    y -= 30;
  }

  // --- Firmas ---
  ensureSpace(70);
  y -= 30;
  const signWidth = CONTENT_WIDTH * 0.4;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + signWidth, y },
    thickness: 1,
    color: LINE,
  });
  page.drawLine({
    start: { x: PAGE_WIDTH - MARGIN - signWidth, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: LINE,
  });
  y -= 12;
  text('Entrega (Conductor)', MARGIN, y, { size: 9, color: MUTED });
  text('Recibe (Cliente)', PAGE_WIDTH - MARGIN - signWidth, y, { size: 9, color: MUTED });

  return pdfDoc.save();
}

// Tipo auxiliar reexportado para evitar importar PDFPage directamente en consumidores
export type { PDFPage };
