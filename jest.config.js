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
  // `@heroui/react` es ESM-only: su `exports["."]` declara solo `import` y `types`, sin
  // `require`. Jest resuelve con condiciones de CommonJS y no lo encuentra. La condición
  // vacía hace que el resolver acepte el export `import`.
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Y como el paquete es ESM, hay que dejar que SWC lo transforme: el patrón por defecto de
  // `next/jest` ignora todo `node_modules`. El `.*` es necesario porque con pnpm la ruta real
  // es `node_modules/.pnpm/@heroui+react@.../node_modules/@heroui/react/...`, así que la
  // excepción no puede anclarse justo después de `/node_modules/`.
  transformIgnorePatterns: ['/node_modules/(?!.*@heroui/)', '^.+\\.module\\.(css|sass|scss)$'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}', '<rootDir>/app/**/*.test.{ts,tsx}'],
  // `next/jest` no traduce el alias `@/*` del tsconfig (solo agrega `@next/font`), así que se
  // declara acá. El tsconfig mapea `@/*` a `./*`.
  moduleNameMapper: {
    // `@heroui/react` es ESM-only (ver testEnvironmentOptions) y el resolver de Jest no lo
    // alcanza, así que se apunta al archivo real. Es el único ESM-only de la familia: sus
    // dependencias (react-aria-components, react-aria, react-stately, @internationalized/*)
    // sí exponen condición `require`, así que no hace falta mapear nada más.
    '^@heroui/react$': '<rootDir>/node_modules/@heroui/react/dist/index.js',
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
