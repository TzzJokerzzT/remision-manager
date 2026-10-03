import { clientSchema } from '@/src/core/application/dtos/client.dto';

const validClient = {
  name: 'Industrias ACME',
  documentId: '900123456',
  companyId: 'company-1',
};

/** Devuelve los paths de los issues para poder afirmar sobre la regla que falló. */
function issuePaths(input: unknown): string[] {
  const result = clientSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('clientSchema', () => {
  it('acepta un cliente válido', () => {
    expect(clientSchema.safeParse(validClient).success).toBe(true);
  });

  it('exige nombre y documentId con su longitud mínima', () => {
    const paths = issuePaths({ ...validClient, name: '', documentId: '12' });
    expect(paths).toContain('name');
    expect(paths).toContain('documentId');
  });

  it('exige companyId', () => {
    expect(issuePaths({ ...validClient, companyId: '' })).toContain('companyId');
  });

  it('acepta los campos opcionales vacíos', () => {
    const result = clientSchema.safeParse({ ...validClient, address: '', phone: '', email: '' });
    expect(result.success).toBe(true);
  });

  it('rechaza un email opcional con formato inválido', () => {
    expect(issuePaths({ ...validClient, email: 'no-es-email' })).toContain('email');
  });

  it('recorta los campos de texto', () => {
    const result = clientSchema.safeParse({
      name: '  Industrias ACME  ',
      documentId: '  900123456  ',
      companyId: 'company-1',
      address: '  Calle 1  ',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe('Industrias ACME');
    expect(result.data.documentId).toBe('900123456');
    expect(result.data.address).toBe('Calle 1');
  });

  it('rechaza name y documentId cuando superan el máximo', () => {
    expect(issuePaths({ ...validClient, name: 'x'.repeat(151) })).toContain('name');
    expect(issuePaths({ ...validClient, documentId: 'x'.repeat(31) })).toContain('documentId');
  });

  it('rechaza teléfono y dirección cuando superan el máximo', () => {
    expect(issuePaths({ ...validClient, phone: 'x'.repeat(31) })).toContain('phone');
    expect(issuePaths({ ...validClient, address: 'x'.repeat(251) })).toContain('address');
  });
});
