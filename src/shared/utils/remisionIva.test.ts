import { withInferredItemIva } from './remisionIva';

/**
 * Los ítems guardados antes de que el IVA fuera por producto no tienen `hasIva`, y el backend
 * ahora los rechaza ("Cada item debe incluir hasIva"). Este helper los completa a partir de los
 * datos que sí quedaron guardados: la remisión vieja tenía una tasa global, así que la tasa
 * implícita se recupera de `ivaValue / subtotal`.
 */
describe('withInferredItemIva', () => {
  it('infiere la tasa de una remisión vieja con una sola tasa', () => {
    const items = withInferredItemIva([{ description: 'Cemento', quantity: 2, unitPrice: 100 }], {
      subtotal: 200,
      ivaValue: 38,
    });

    expect(items[0]).toMatchObject({ hasIva: true, ivaPercentage: 19, ivaValue: 38 });
  });

  it('recupera una tasa que no es la estándar', () => {
    const items = withInferredItemIva([{ description: 'A', quantity: 1, unitPrice: 200 }], {
      subtotal: 200,
      ivaValue: 19,
    });

    expect(items[0]).toMatchObject({ hasIva: true, ivaPercentage: 9.5, ivaValue: 19 });
  });

  it('marca los ítems como exentos cuando la remisión vieja no tenía IVA', () => {
    const items = withInferredItemIva([{ description: 'A', quantity: 1, unitPrice: 100 }], {
      subtotal: 100,
      ivaValue: 0,
    });

    expect(items[0].hasIva).toBe(false);
    expect(items[0]).not.toHaveProperty('ivaPercentage');
    expect(items[0]).not.toHaveProperty('ivaValue');
  });

  it('no toca los ítems que ya declaran hasIva', () => {
    const items = withInferredItemIva(
      [
        { description: 'Exento explícito', quantity: 1, unitPrice: 100, hasIva: false },
        { description: 'Gravado explícito', quantity: 1, unitPrice: 100, hasIva: true, ivaPercentage: 5 },
      ],
      { subtotal: 200, ivaValue: 38 }
    );

    expect(items[0].hasIva).toBe(false);
    expect(items[0]).not.toHaveProperty('ivaPercentage');
    expect(items[1].ivaPercentage).toBe(5);
  });

  it('sin datos de totales deja los ítems como exentos, sin dividir por cero', () => {
    const sinTotales = withInferredItemIva([{ description: 'A', quantity: 1, unitPrice: 100 }], {});
    const subtotalCero = withInferredItemIva([{ description: 'A', quantity: 1, unitPrice: 100 }], {
      subtotal: 0,
      ivaValue: 0,
    });

    expect(sinTotales[0].hasIva).toBe(false);
    expect(subtotalCero[0].hasIva).toBe(false);
  });

  it('descarta un ivaValue viejo del ítem cuando se infiere exento', () => {
    const items = withInferredItemIva([{ description: 'A', quantity: 1, unitPrice: 100, ivaValue: 5 }], {
      subtotal: 100,
      ivaValue: 0,
    });

    expect(items[0]).not.toHaveProperty('ivaValue');
  });

  it('preserva el resto de las propiedades del ítem', () => {
    const items = withInferredItemIva([{ description: 'Cemento 50kg', quantity: 3, unitPrice: 12.5 }], {
      subtotal: 37.5,
      ivaValue: 7.13,
    });

    expect(items[0].description).toBe('Cemento 50kg');
    expect(items[0].quantity).toBe(3);
    expect(items[0].unitPrice).toBe(12.5);
  });
});
