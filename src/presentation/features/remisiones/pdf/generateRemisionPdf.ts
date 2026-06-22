import { PDFDocument, type PDFFont, type PDFImage, type RGB, rgb, StandardFonts } from 'pdf-lib';
import type { Client } from '@/src/core/domain/entities/Client';
import type { Company } from '@/src/core/domain/entities/Company';
import type { Driver } from '@/src/core/domain/entities/Driver';
import type { Remision } from '@/src/core/domain/entities/Remision';

const PAGE_WIDTH = 595.28; // A4 en puntos
const PAGE_HEIGHT = 841.89;
const MARGIN = 44;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// --- Paleta ---
const INK = rgb(0.1, 0.11, 0.15);
const MUTED = rgb(0.48, 0.49, 0.55);
const SUBTLE = rgb(0.65, 0.66, 0.7);
const LINE = rgb(0.88, 0.89, 0.92);
const ACCENT = rgb(0.15, 0.34, 0.93); // azul marca
const ACCENT_SOFT = rgb(0.93, 0.95, 1); // fondo azul claro
const CARD_BG = rgb(0.97, 0.97, 0.98);
const ZEBRA = rgb(0.975, 0.975, 0.98);
const WHITE = rgb(1, 1, 1);

const LOGO_BOX = 56;
const HEADER_HEIGHT = 96;

function formatCurrency(value: number) {
  return `$ ${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
}

function truncateToWidth(value: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(value, size) <= maxWidth) return value;
  let result = value;
  while (result.length > 1 && font.widthOfTextAtSize(`${result}…`, size) > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

/** Descarga y embebe el logo de la empresa. Devuelve null si falla (CORS, 404, formato no soportado, etc). */
async function embedCompanyLogo(
  pdfDoc: PDFDocument,
  logoUrl: string | null | undefined
): Promise<PDFImage | null> {
  if (!logoUrl) return null;
  try {
    const response = await fetch(logoUrl, { mode: 'cors' });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') ?? '';
    const bytes = new Uint8Array(await response.arrayBuffer());

    if (contentType.includes('png') || logoUrl.toLowerCase().endsWith('.png')) {
      return await pdfDoc.embedPng(bytes);
    }
    if (contentType.includes('jpeg') || contentType.includes('jpg') || /\.(jpe?g)$/i.test(logoUrl)) {
      return await pdfDoc.embedJpg(bytes);
    }
    // Intento best-effort si el content-type no es concluyente
    try {
      return await pdfDoc.embedPng(bytes);
    } catch {
      return await pdfDoc.embedJpg(bytes);
    }
  } catch {
    return null; // CORS, red caída, formato no soportado (ej. SVG/WebP no son soportados por pdf-lib)
  }
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
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logoImage = await embedCompanyLogo(pdfDoc, company.logoUrl);

  const isPriced = remision.type === 'priced';

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPage() {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    drawContinuationHeader();
  }

  function ensureSpace(minSpace: number) {
    if (y - minSpace < MARGIN + 24) newPage();
  }

  function text(
    value: string,
    x: number,
    yPos: number,
    options: { font?: PDFFont; size?: number; color?: RGB } = {}
  ) {
    page.drawText(value, {
      x,
      y: yPos,
      size: options.size ?? 10,
      font: options.font ?? font,
      color: options.color ?? INK,
    });
  }

  function textRight(
    value: string,
    rightX: number,
    yPos: number,
    options: { font?: PDFFont; size?: number; color?: RGB } = {}
  ) {
    const f = options.font ?? font;
    const size = options.size ?? 10;
    const width = f.widthOfTextAtSize(value, size);
    text(value, rightX - width, yPos, options);
  }

  function hLine(yPos: number, color = LINE, thickness = 1, fromX = MARGIN, toX = PAGE_WIDTH - MARGIN) {
    page.drawLine({ start: { x: fromX, y: yPos }, end: { x: toX, y: yPos }, thickness, color });
  }

  function rect(
    x: number,
    yTop: number,
    width: number,
    height: number,
    options: { fill?: RGB; border?: RGB; borderWidth?: number } = {}
  ) {
    page.drawRectangle({
      x,
      y: yTop - height,
      width,
      height,
      color: options.fill,
      borderColor: options.border,
      borderWidth: options.borderWidth ?? (options.border ? 1 : 0),
    });
  }

  // ============ ENCABEZADO (solo primera página) ============
  function drawMainHeader() {
    // Logo o placeholder con inicial
    if (logoImage) {
      const scale = Math.min(LOGO_BOX / logoImage.width, LOGO_BOX / logoImage.height);
      const w = logoImage.width * scale;
      const h = logoImage.height * scale;
      page.drawImage(logoImage, {
        x: MARGIN,
        y: PAGE_HEIGHT - MARGIN - (LOGO_BOX - h) / 2 - h,
        width: w,
        height: h,
      });
    } else {
      rect(MARGIN, PAGE_HEIGHT - MARGIN, LOGO_BOX, LOGO_BOX, { fill: ACCENT_SOFT });
      const initial = company.name.trim().charAt(0).toUpperCase() || '?';
      const initialSize = 22;
      const iw = fontBold.widthOfTextAtSize(initial, initialSize);
      text(initial, MARGIN + (LOGO_BOX - iw) / 2, PAGE_HEIGHT - MARGIN - LOGO_BOX / 2 - initialSize * 0.36, {
        font: fontBold,
        size: initialSize,
        color: ACCENT,
      });
    }

    const textX = MARGIN + LOGO_BOX + 14;
    const textMaxWidth = CONTENT_WIDTH * 0.5 - LOGO_BOX - 14;
    let infoY = PAGE_HEIGHT - MARGIN - 4;
    text(truncateToWidth(company.name, fontBold, 14, textMaxWidth), textX, infoY, {
      font: fontBold,
      size: 14,
    });
    infoY -= 16;
    text(`NIT ${company.nit}`, textX, infoY, { size: 9, color: MUTED });
    infoY -= 13;
    const contactLine = [company.address, company.phone].filter(Boolean).join('  ·  ');
    if (contactLine) {
      text(truncateToWidth(contactLine, font, 9, textMaxWidth), textX, infoY, { size: 9, color: MUTED });
      infoY -= 13;
    }
    if (company.email) {
      text(truncateToWidth(company.email, font, 9, textMaxWidth), textX, infoY, { size: 9, color: MUTED });
    }

    // Bloque derecho: título + badge de consecutivo
    const rightX = PAGE_WIDTH - MARGIN;
    textRight('REMISIÓN', rightX, PAGE_HEIGHT - MARGIN - 2, { font: fontBold, size: 20, color: ACCENT });

    const badgeText = `No. ${String(remision.consecutive).padStart(5, '0')}`;
    const badgeSize = 11;
    const badgePaddingX = 10;
    const badgeWidth = fontBold.widthOfTextAtSize(badgeText, badgeSize) + badgePaddingX * 2;
    const badgeHeight = 22;
    const badgeTop = PAGE_HEIGHT - MARGIN - 28;
    rect(rightX - badgeWidth, badgeTop, badgeWidth, badgeHeight, { fill: ACCENT_SOFT });
    text(badgeText, rightX - badgeWidth + badgePaddingX, badgeTop - badgeHeight + 6.5, {
      font: fontBold,
      size: badgeSize,
      color: ACCENT,
    });

    textRight(formatDate(remision.createdAt), rightX, badgeTop - badgeHeight - 14, { size: 9, color: MUTED });
    const typeLabel = isPriced ? 'Con precio + IVA' : 'Solo cantidad';
    textRight(typeLabel, rightX, badgeTop - badgeHeight - 27, { size: 8.5, color: SUBTLE });

    y = PAGE_HEIGHT - MARGIN - HEADER_HEIGHT;
    hLine(y, LINE, 1.4);
    y -= 26;
  }

  // ============ ENCABEZADO (páginas siguientes) ============
  function drawContinuationHeader() {
    text(company.name, MARGIN, y, { font: fontBold, size: 11 });
    textRight(
      `Remisión No. ${String(remision.consecutive).padStart(5, '0')} (cont.)`,
      PAGE_WIDTH - MARGIN,
      y,
      {
        size: 9,
        color: MUTED,
      }
    );
    y -= 10;
    hLine(y);
    y -= 22;
  }

  // ============ PIE DE PÁGINA (se dibuja al final sobre todas las páginas) ============
  function drawFooter(pageNumber: number, totalPages: number, targetPage = page) {
    const footerY = MARGIN - 10;
    targetPage.drawLine({
      start: { x: MARGIN, y: footerY + 16 },
      end: { x: PAGE_WIDTH - MARGIN, y: footerY + 16 },
      thickness: 0.75,
      color: LINE,
    });
    targetPage.drawText('Generado digitalmente · documento de remisión', {
      x: MARGIN,
      y: footerY,
      size: 7.5,
      font,
      color: SUBTLE,
    });
    const pageLabel = `Página ${pageNumber} de ${totalPages}`;
    const w = font.widthOfTextAtSize(pageLabel, 7.5);
    targetPage.drawText(pageLabel, {
      x: PAGE_WIDTH - MARGIN - w,
      y: footerY,
      size: 7.5,
      font,
      color: SUBTLE,
    });
  }

  drawMainHeader();

  // ============ TARJETAS CLIENTE / CONDUCTOR ============
  const cardGap = 14;
  const cardWidth = (CONTENT_WIDTH - cardGap) / 2;
  const cardHeight = 64;
  const cardTop = y;

  rect(MARGIN, cardTop, cardWidth, cardHeight, { fill: CARD_BG });
  rect(MARGIN + cardWidth + cardGap, cardTop, cardWidth, cardHeight, { fill: CARD_BG });

  const padX = 12;
  let leftY = cardTop - 16;
  let rightY = cardTop - 16;
  const leftX = MARGIN + padX;
  const rightX2 = MARGIN + cardWidth + cardGap + padX;
  const cardTextMax = cardWidth - padX * 2;

  text('CLIENTE', leftX, leftY, { font: fontBold, size: 8, color: SUBTLE });
  text('CONDUCTOR', rightX2, rightY, { font: fontBold, size: 8, color: SUBTLE });
  leftY -= 15;
  rightY -= 15;

  text(truncateToWidth(client.name, fontBold, 11, cardTextMax), leftX, leftY, { font: fontBold, size: 11 });
  text(truncateToWidth(driver.name, fontBold, 11, cardTextMax), rightX2, rightY, {
    font: fontBold,
    size: 11,
  });
  leftY -= 14;
  rightY -= 14;

  text(`Doc. ${client.documentId}`, leftX, leftY, { size: 8.5, color: MUTED });
  text(`Doc. ${driver.documentId}`, rightX2, rightY, { size: 8.5, color: MUTED });
  leftY -= 12;
  rightY -= 12;

  const clientExtra = [client.phone, client.address].filter(Boolean).join(' · ');
  const driverExtra = [driver.phone, driver.vehiclePlate ? `Placa ${driver.vehiclePlate}` : null]
    .filter(Boolean)
    .join(' · ');
  if (clientExtra)
    text(truncateToWidth(clientExtra, font, 8.5, cardTextMax), leftX, leftY, { size: 8.5, color: MUTED });
  if (driverExtra)
    text(truncateToWidth(driverExtra, font, 8.5, cardTextMax), rightX2, rightY, { size: 8.5, color: MUTED });

  y = cardTop - cardHeight - 26;

  // ============ TABLA DE ÍTEMS ============
  const colDescX = MARGIN + 10;
  const colQtyX = MARGIN + CONTENT_WIDTH * 0.56;
  const colPriceX = MARGIN + CONTENT_WIDTH * 0.73;
  const colTotalX = PAGE_WIDTH - MARGIN - 10;
  const rowHeight = 22;

  function drawTableHeader() {
    rect(MARGIN, y, CONTENT_WIDTH, 26, { fill: INK });
    const headerY = y - 17;
    text('DESCRIPCIÓN', colDescX, headerY, { font: fontBold, size: 8.5, color: WHITE });
    text('CANT.', colQtyX, headerY, { font: fontBold, size: 8.5, color: WHITE });
    if (isPriced) {
      text('PRECIO UNIT.', colPriceX, headerY, { font: fontBold, size: 8.5, color: WHITE });
      textRight('TOTAL', colTotalX, headerY, { font: fontBold, size: 8.5, color: WHITE });
    }
    y -= 26;
  }

  drawTableHeader();

  remision.items.forEach((item, index) => {
    ensureSpace(rowHeight + 10);
    // si saltó de página, hay que re-trazar el header de tabla
    if (y === PAGE_HEIGHT - MARGIN - 22) drawTableHeader();

    if (index % 2 === 1) {
      rect(MARGIN, y, CONTENT_WIDTH, rowHeight, { fill: ZEBRA });
    }

    const lineTotal = (item.unitPrice ?? 0) * item.quantity;
    const rowTextY = y - 14.5;
    text(truncateToWidth(item.description, font, 9.5, colQtyX - colDescX - 8), colDescX, rowTextY, {
      size: 9.5,
    });
    text(String(item.quantity), colQtyX, rowTextY, { size: 9.5 });
    if (isPriced) {
      text(formatCurrency(item.unitPrice ?? 0), colPriceX, rowTextY, { size: 9.5 });
      textRight(formatCurrency(lineTotal), colTotalX, rowTextY, { size: 9.5, font: fontBold });
    }
    y -= rowHeight;
  });

  hLine(y, LINE, 1);
  y -= 22;

  // ============ TOTALES ============
  if (isPriced) {
    ensureSpace(110);
    const boxWidth = 220;
    const boxX = PAGE_WIDTH - MARGIN - boxWidth;
    const boxTop = y;
    const lineH = 20;
    const boxHeight = lineH * 3 + 14;

    rect(boxX, boxTop, boxWidth, boxHeight, { fill: CARD_BG });
    let rowY = boxTop - 16;
    const labelX = boxX + 14;
    const valueRightX = boxX + boxWidth - 14;

    text('Subtotal', labelX, rowY, { size: 9.5, color: MUTED });
    textRight(formatCurrency(remision.subtotal ?? 0), valueRightX, rowY, { size: 9.5 });
    rowY -= lineH;

    text(`IVA (${remision.ivaPercentage ?? 0}%)`, labelX, rowY, { size: 9.5, color: MUTED });
    textRight(formatCurrency(remision.ivaValue ?? 0), valueRightX, rowY, { size: 9.5 });
    rowY -= lineH;

    hLine(rowY + 12, LINE, 1, boxX + 14, boxX + boxWidth - 14);

    text('TOTAL', labelX, rowY - 2, { font: fontBold, size: 11.5 });
    textRight(formatCurrency(remision.total ?? 0), valueRightX, rowY - 2, {
      font: fontBold,
      size: 11.5,
      color: ACCENT,
    });

    y = boxTop - boxHeight - 24;
  }

  // ============ NOTAS ============
  if (remision.notes) {
    ensureSpace(60);
    text('NOTAS', MARGIN, y, { font: fontBold, size: 8.5, color: SUBTLE });
    y -= 15;
    const words = remision.notes.split(' ');
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, 9.5) > CONTENT_WIDTH) {
        text(line, MARGIN, y, { size: 9.5, color: INK });
        y -= 13;
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) {
      text(line, MARGIN, y, { size: 9.5, color: INK });
      y -= 13;
    }
    y -= 16;
  }

  // ============ FIRMAS ============
  ensureSpace(80);
  y -= 26;
  const signWidth = CONTENT_WIDTH * 0.38;
  hLine(y, LINE, 1, MARGIN, MARGIN + signWidth);
  hLine(y, LINE, 1, PAGE_WIDTH - MARGIN - signWidth, PAGE_WIDTH - MARGIN);
  y -= 12;
  text('Entrega (Conductor)', MARGIN, y, { size: 8.5, color: MUTED });
  textRight('Recibe (Cliente)', PAGE_WIDTH - MARGIN, y, { size: 8.5, color: MUTED });

  // ============ PIE DE PÁGINA EN TODAS LAS PÁGINAS ============
  const allPages = pdfDoc.getPages();
  allPages.forEach((p, i) => {
    drawFooter(i + 1, allPages.length, p);
  });

  return pdfDoc.save();
}
