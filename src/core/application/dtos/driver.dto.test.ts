import { driverSchema } from '@/src/core/application/dtos/driver.dto';

const validDriver = {
  name: 'Carlos Rueda',
  documentId: '12345678',
  companyId: 'company-1',
};

/** Devuelve los paths de los issues para poder afirmar sobre la regla que falló. */
function issuePaths(input: unknown): string[] {
  const result = driverSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.path.join('.'));
}

describe('driverSchema', () => {
  it('acepta un conductor válido', () => {
    expect(driverSchema.safeParse(validDriver).success).toBe(true);
  });

  it('exige nombre, documento y empresa', () => {
    const paths = issuePaths({ ...validDriver, name: '', documentId: '', companyId: '' });
    expect(paths).toContain('name');
    expect(paths).toContain('documentId');
    expect(paths).toContain('companyId');
  });

  it('acepta los campos opcionales vacíos', () => {
    const result = driverSchema.safeParse({
      ...validDriver,
      licenseNumber: '',
      phone: '',
      vehiclePlate: '',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza una placa que supera 15 caracteres', () => {
    expect(issuePaths({ ...validDriver, vehiclePlate: 'x'.repeat(16) })).toContain('vehiclePlate');
  });

  it('rechaza licencia y teléfono cuando superan el máximo', () => {
    expect(issuePaths({ ...validDriver, licenseNumber: 'x'.repeat(31) })).toContain('licenseNumber');
    expect(issuePaths({ ...validDriver, phone: 'x'.repeat(31) })).toContain('phone');
  });

  it('recorta los campos de texto', () => {
    const result = driverSchema.safeParse({
      name: '  Carlos Rueda  ',
      documentId: '  12345678  ',
      companyId: 'company-1',
      vehiclePlate: '  ABC-123  ',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe('Carlos Rueda');
    expect(result.data.documentId).toBe('12345678');
    expect(result.data.vehiclePlate).toBe('ABC-123');
  });
});
