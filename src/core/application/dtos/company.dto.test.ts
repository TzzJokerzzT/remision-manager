import { companySchema } from '@/src/core/application/dtos/company.dto';

const validCompany = {
  name: 'Transportes XYZ',
  nit: '900123456',
};

/** Devuelve los paths de los issues para poder afirmar sobre la regla que falló. */
function issuePaths(input: unknown): string[] {
  const result = companySchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('companySchema', () => {
  it('acepta una empresa válida', () => {
    expect(companySchema.safeParse(validCompany).success).toBe(true);
  });

  it('exige nombre y nit', () => {
    const paths = issuePaths({ ...validCompany, name: '', nit: '' });
    expect(paths).toContain('name');
    expect(paths).toContain('nit');
  });

  it('acepta logoUrl vacío', () => {
    const result = companySchema.safeParse({ ...validCompany, logoUrl: '' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.logoUrl).toBe('');
  });

  it('rechaza un logoUrl que no es una URL', () => {
    expect(issuePaths({ ...validCompany, logoUrl: 'no-es-url' })).toContain('logoUrl');
  });

  it('solo acepta la cadena vacía exacta como logoUrl, no espacios', () => {
    expect(issuePaths({ ...validCompany, logoUrl: '   ' })).toContain('logoUrl');
  });

  it('recorta el logoUrl antes de validarlo', () => {
    const result = companySchema.safeParse({
      ...validCompany,
      logoUrl: '  https://cdn.example.com/logo.png  ',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.logoUrl).toBe('https://cdn.example.com/logo.png');
  });

  it('acepta los campos opcionales vacíos', () => {
    const result = companySchema.safeParse({ ...validCompany, address: '', phone: '', email: '' });
    expect(result.success).toBe(true);
  });

  it('rechaza un email opcional con formato inválido', () => {
    expect(issuePaths({ ...validCompany, email: 'no-es-email' })).toContain('email');
  });
});
