// `@react-pdf/renderer` es ESM-only y el resolver de Jest no lo alcanza, así que se reemplaza
// por lo mínimo que necesita este test: `StyleSheet.create` como identidad. El mock es local a
// este archivo a propósito — no hace falta uno global, y así ningún otro test queda afectado.
jest.mock('@react-pdf/renderer', () => ({
  StyleSheet: { create: (sheet: unknown) => sheet },
}));

import { styles } from './styles';

/**
 * Invariante de layout de la tabla del PDF.
 *
 * Existe por un bug real: la columna de descripción tenía un 50 % fijo y, sumada a las
 * numéricas, los anchos daban 110 %. El layout comprimía las columnas y el importe de IVA
 * —la más angosta, 10 %— terminaba partido en dos líneas. Ni el typecheck ni el build ven
 * eso, y el PDF no se puede renderizar en jsdom, así que la aritmética de los anchos queda
 * anclada acá.
 */
const fixedColumns = () => [
  styles.tableCellQty,
  styles.tableCellPrice,
  styles.tableCellIva,
  styles.tableCellTotal,
];

function percentageOf(value: unknown): number | undefined {
  if (typeof value !== 'string' || !value.endsWith('%')) return undefined;
  const parsed = Number(value.slice(0, -1));
  return Number.isNaN(parsed) ? undefined : parsed;
}

describe('estilos de la tabla del PDF', () => {
  it('deja la descripción elástica y sin ancho fijo', () => {
    expect('width' in styles.tableCellDescription).toBe(false);
    expect(styles.tableCellDescription.flexGrow).toBe(1);
    expect(styles.tableCellDescription.flexBasis).toBe(0);
  });

  it('no reparte más del 100% entre las columnas de ancho fijo', () => {
    const total = fixedColumns().reduce((acc, style) => acc + (percentageOf(style.width) ?? 0), 0);

    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(100);
  });

  it('da ancho suficiente a la columna de IVA para un importe largo', () => {
    const iva = percentageOf(styles.tableCellIva.width);

    // 16 % del ancho útil de una A4 deja lugar de sobra para "$ 12.345.678" a 10pt.
    expect(iva).toBeGreaterThanOrEqual(12);
  });

  it('impide que las columnas numéricas se compriman', () => {
    for (const style of fixedColumns()) {
      expect(style.flexShrink).toBe(0);
    }
  });
});
