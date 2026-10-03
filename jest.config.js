const nextJest = require('next/jest.js');

const createJestConfig = nextJest({ dir: './' });

/**
 * Configuración de Jest.
 *
 * Se usa el wrapper oficial `next/jest`, que toma la configuración de Next
 * (alias de tsconfig, CSS, next/font, imágenes) y transforma con SWC, así que no
 * hace falta ts-jest ni babel.
 *
 * `clearMocks` y `restoreMocks` están activos a propósito: un gate estricto no
 * debe depender de que cada test se acuerde de limpiar sus espías.
 *
 * @type {import('jest').Config}
 */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}', '<rootDir>/app/**/*.test.{ts,tsx}'],
  // `next/jest` no traduce el alias `@/*` del tsconfig (solo agrega `@next/font`), así que se
  // declara acá. El tsconfig mapea `@/*` a `./*`.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/core/infrastructure/http/**',
  ],
};

module.exports = createJestConfig(config);
