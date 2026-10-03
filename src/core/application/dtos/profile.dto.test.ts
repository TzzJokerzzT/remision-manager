import { profileSchema } from '@/src/core/application/dtos/profile.dto';

const validProfile = {
  name: 'Ana Pérez',
};

/** Devuelve los paths de los issues para poder afirmar sobre la regla que falló. */
function issuePaths(input: unknown): string[] {
  const result = profileSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('profileSchema', () => {
  it('acepta un perfil válido', () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it('exige un nombre de al menos 2 caracteres', () => {
    expect(issuePaths({ ...validProfile, name: 'A' })).toContain('name');
  });

  it('rechaza un nombre de más de 120 caracteres', () => {
    expect(issuePaths({ ...validProfile, name: 'x'.repeat(121) })).toContain('name');
  });

  it('recorta el nombre', () => {
    const result = profileSchema.safeParse({ name: '  Ana Pérez  ' });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe('Ana Pérez');
  });

  it('acepta companyLogoUrl vacío', () => {
    const result = profileSchema.safeParse({ ...validProfile, companyLogoUrl: '' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.companyLogoUrl).toBe('');
  });

  it('rechaza un companyLogoUrl que no es una URL', () => {
    expect(issuePaths({ ...validProfile, companyLogoUrl: 'no-es-url' })).toContain('companyLogoUrl');
  });
});
