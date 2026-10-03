import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cloudinaryImageUrl } from './cloudinary';

const BASE = 'https://res.cloudinary.com/demo/image/upload';

test('cloudinaryImageUrl > inserta f_auto, q_auto y el tamaño pedido', () => {
  assert.equal(
    cloudinaryImageUrl(`${BASE}/v1699999999/logos/acme.png`, { width: 96, height: 96, crop: 'fill' }),
    `${BASE}/f_auto,q_auto,w_96,h_96,c_fill/v1699999999/logos/acme.png`
  );
});

test('cloudinaryImageUrl > solo ancho cuando no se pide alto ni recorte', () => {
  assert.equal(
    cloudinaryImageUrl(`${BASE}/v1699999999/logos/acme.png`, { width: 96 }),
    `${BASE}/f_auto,q_auto,w_96/v1699999999/logos/acme.png`
  );
});

test('cloudinaryImageUrl > sin opciones deja solo las optimizaciones automáticas', () => {
  assert.equal(
    cloudinaryImageUrl(`${BASE}/v1699999999/logos/acme.png`),
    `${BASE}/f_auto,q_auto/v1699999999/logos/acme.png`
  );
});

test('cloudinaryImageUrl > funciona sin versión en la URL', () => {
  assert.equal(
    cloudinaryImageUrl(`${BASE}/logos/acme.png`, { width: 96 }),
    `${BASE}/f_auto,q_auto,w_96/logos/acme.png`
  );
});

test('cloudinaryImageUrl > antepone la transformación si ya existía una (encadenada)', () => {
  assert.equal(
    cloudinaryImageUrl(`${BASE}/w_500/v1699999999/logos/acme.png`, { width: 96 }),
    `${BASE}/f_auto,q_auto,w_96/w_500/v1699999999/logos/acme.png`
  );
});

test('cloudinaryImageUrl > deja intacta una URL de otro host', () => {
  const other = 'https://example.com/logo.png';
  assert.equal(cloudinaryImageUrl(other, { width: 96 }), other);
});

test('cloudinaryImageUrl > deja intacta una URL de entrega que no es de imagen', () => {
  const raw = 'https://res.cloudinary.com/demo/raw/upload/v1/documentos/contrato.pdf';
  assert.equal(cloudinaryImageUrl(raw, { width: 96 }), raw);
});

test('cloudinaryImageUrl > deja intactos blob: y data:', () => {
  const blob = 'blob:http://localhost:3003/2f9a-1c';
  const data = 'data:image/png;base64,iVBORw0KGgo=';
  assert.equal(cloudinaryImageUrl(blob, { width: 96 }), blob);
  assert.equal(cloudinaryImageUrl(data, { width: 96 }), data);
});

test('cloudinaryImageUrl > devuelve undefined para vacíos', () => {
  assert.equal(cloudinaryImageUrl(null), undefined);
  assert.equal(cloudinaryImageUrl(undefined), undefined);
  assert.equal(cloudinaryImageUrl(''), undefined);
  assert.equal(cloudinaryImageUrl('   '), undefined);
});

test('cloudinaryImageUrl > recorta espacios alrededor de la URL', () => {
  assert.equal(
    cloudinaryImageUrl(`  ${BASE}/v1/logos/acme.png  `, { width: 96 }),
    `${BASE}/f_auto,q_auto,w_96/v1/logos/acme.png`
  );
});
