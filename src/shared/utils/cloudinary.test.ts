import { cloudinaryImageUrl } from './cloudinary';

const BASE = 'https://res.cloudinary.com/demo/image/upload';

describe('cloudinaryImageUrl', () => {
  it('inserta f_auto, q_auto y el tamaño pedido', () => {
    expect(
      cloudinaryImageUrl(`${BASE}/v1699999999/logos/acme.png`, { width: 96, height: 96, crop: 'fill' })
    ).toBe(`${BASE}/f_auto,q_auto,w_96,h_96,c_fill/v1699999999/logos/acme.png`);
  });

  it('solo ancho cuando no se pide alto ni recorte', () => {
    expect(cloudinaryImageUrl(`${BASE}/v1699999999/logos/acme.png`, { width: 96 })).toBe(
      `${BASE}/f_auto,q_auto,w_96/v1699999999/logos/acme.png`
    );
  });

  it('sin opciones deja solo las optimizaciones automáticas', () => {
    expect(cloudinaryImageUrl(`${BASE}/v1699999999/logos/acme.png`)).toBe(
      `${BASE}/f_auto,q_auto/v1699999999/logos/acme.png`
    );
  });

  it('funciona sin versión en la URL', () => {
    expect(cloudinaryImageUrl(`${BASE}/logos/acme.png`, { width: 96 })).toBe(
      `${BASE}/f_auto,q_auto,w_96/logos/acme.png`
    );
  });

  it('antepone la transformación si ya existía una (encadenada)', () => {
    expect(cloudinaryImageUrl(`${BASE}/w_500/v1699999999/logos/acme.png`, { width: 96 })).toBe(
      `${BASE}/f_auto,q_auto,w_96/w_500/v1699999999/logos/acme.png`
    );
  });

  it('deja intacta una URL de otro host', () => {
    const other = 'https://example.com/logo.png';
    expect(cloudinaryImageUrl(other, { width: 96 })).toBe(other);
  });

  it('deja intacta una URL de entrega que no es de imagen', () => {
    const raw = 'https://res.cloudinary.com/demo/raw/upload/v1/documentos/contrato.pdf';
    expect(cloudinaryImageUrl(raw, { width: 96 })).toBe(raw);
  });

  it('deja intactos blob: y data:', () => {
    const blob = 'blob:http://localhost:3003/2f9a-1c';
    const data = 'data:image/png;base64,iVBORw0KGgo=';
    expect(cloudinaryImageUrl(blob, { width: 96 })).toBe(blob);
    expect(cloudinaryImageUrl(data, { width: 96 })).toBe(data);
  });

  it('devuelve undefined para vacíos', () => {
    expect(cloudinaryImageUrl(null)).toBeUndefined();
    expect(cloudinaryImageUrl(undefined)).toBeUndefined();
    expect(cloudinaryImageUrl('')).toBeUndefined();
    expect(cloudinaryImageUrl('   ')).toBeUndefined();
  });

  it('recorta espacios alrededor de la URL', () => {
    expect(cloudinaryImageUrl(`  ${BASE}/v1/logos/acme.png  `, { width: 96 })).toBe(
      `${BASE}/f_auto,q_auto,w_96/v1/logos/acme.png`
    );
  });
});
