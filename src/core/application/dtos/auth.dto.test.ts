import type { ZodType } from 'zod';
import { loginSchema, registerSchema } from '@/src/core/application/dtos/auth.dto';

const validRegister = {
  name: 'Ana Pérez',
  email: 'ana@correo.com',
  password: 'Abcdefg1',
  confirmPassword: 'Abcdefg1',
};

/** Devuelve los paths de los issues para poder afirmar sobre la regla que falló. */
function issuePaths(schema: ZodType, input: unknown): string[] {
  const result = schema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('registerSchema', () => {
  it('acepta un registro válido y recorta nombre y email', () => {
    const result = registerSchema.safeParse({
      name: '  Ana Pérez  ',
      email: '  ana@correo.com  ',
      password: 'Abcdefg1',
      confirmPassword: 'Abcdefg1',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe('Ana Pérez');
    expect(result.data.email).toBe('ana@correo.com');
  });

  it('exige al menos 8 caracteres en la contraseña', () => {
    expect(
      issuePaths(registerSchema, { ...validRegister, password: 'Ab1', confirmPassword: 'Ab1' })
    ).toContain('password');
  });

  it('exige una mayúscula en la contraseña', () => {
    expect(
      issuePaths(registerSchema, {
        ...validRegister,
        password: 'abcdefgh1',
        confirmPassword: 'abcdefgh1',
      })
    ).toContain('password');
  });

  it('exige una minúscula en la contraseña', () => {
    expect(
      issuePaths(registerSchema, {
        ...validRegister,
        password: 'ABCDEFGH1',
        confirmPassword: 'ABCDEFGH1',
      })
    ).toContain('password');
  });

  it('exige un número en la contraseña', () => {
    expect(
      issuePaths(registerSchema, {
        ...validRegister,
        password: 'Abcdefgh',
        confirmPassword: 'Abcdefgh',
      })
    ).toContain('password');
  });

  it('rechaza una contraseña de más de 100 caracteres', () => {
    const longPassword = `A1${'b'.repeat(99)}`;
    expect(
      issuePaths(registerSchema, {
        ...validRegister,
        password: longPassword,
        confirmPassword: longPassword,
      })
    ).toContain('password');
  });

  it('exige que la confirmación coincida con la contraseña', () => {
    expect(issuePaths(registerSchema, { ...validRegister, confirmPassword: 'Otra123' })).toContain(
      'confirmPassword'
    );
  });

  it('exige la confirmación de contraseña', () => {
    expect(issuePaths(registerSchema, { ...validRegister, confirmPassword: '' })).toContain(
      'confirmPassword'
    );
  });

  it('rechaza un email con formato inválido', () => {
    expect(issuePaths(registerSchema, { ...validRegister, email: 'no-es-un-email' })).toContain('email');
  });

  it('exige un nombre de al menos 2 caracteres', () => {
    expect(issuePaths(registerSchema, { ...validRegister, name: 'A' })).toContain('name');
  });
});

describe('loginSchema', () => {
  it('acepta un login válido y recorta el email', () => {
    const result = loginSchema.safeParse({ email: '  ana@correo.com  ', password: 'cualquiera' });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.email).toBe('ana@correo.com');
  });

  it('rechaza un email con formato inválido', () => {
    expect(issuePaths(loginSchema, { email: 'no-es-un-email', password: 'x' })).toContain('email');
  });

  it('exige la contraseña', () => {
    expect(issuePaths(loginSchema, { email: 'ana@correo.com', password: '' })).toContain('password');
  });
});
