import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Invariante de carga perezosa de framer-motion.
 *
 * Este test existe porque el error que previene ya ocurrió y fue silencioso: alguien
 * envolvió cada componente en `LazyMotion` pero siguió usando `motion.div`, así que no
 * hubo carga perezosa y el bundle SUBIÓ ~6.5 KiB gz por ruta. El typecheck no lo ve, el
 * lint tampoco y los tests de componentes tampoco: es una regresión de peso invisible.
 *
 * Las tres reglas:
 *  1. Nada usa `motion.*`; se usa `m.*`.
 *  2. Nada importa el componente `motion` de framer-motion.
 *  3. `LazyMotion` se monta una sola vez, en el provider de la raíz.
 */

const REPO_ROOT = join(__dirname, '..', '..');
const SCAN_DIRS = ['src', 'app'];

/** Rutas que legítimamente mencionan estas APIs: son la implementación del provider. */
const ALLOWED = [
  'src/presentation/providers/MotionProvider.tsx',
  'src/presentation/providers/motionFeatures.ts',
];

function sourceFiles(dir: string, acc: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }

  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      sourceFiles(full, acc);
    } else if (/\.(ts|tsx)$/.test(full) && !full.includes('.test.')) {
      acc.push(full);
    }
  }
  return acc;
}

function offenders(pattern: RegExp, description: string): string[] {
  const found: string[] = [];

  for (const dir of SCAN_DIRS) {
    for (const file of sourceFiles(join(REPO_ROOT, dir))) {
      const rel = relative(REPO_ROOT, file);
      if (ALLOWED.includes(rel)) continue;

      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          found.push(`${rel}:${index + 1} (${description}) ${line.trim()}`);
        }
      });
    }
  }
  return found;
}

describe('carga perezosa de framer-motion', () => {
  it('no usa el componente `motion` en ningún lado (usaría `m`)', () => {
    expect(offenders(/\bmotion\.\w/, 'uso de motion.*')).toEqual([]);
  });

  it('no importa `motion` de framer-motion', () => {
    expect(
      offenders(/import\s*\{[^}]*\bmotion\b[^}]*\}\s*from\s*'framer-motion'/, 'import de motion')
    ).toEqual([]);
  });

  it('monta LazyMotion una sola vez, en el provider de la raíz', () => {
    expect(offenders(/\bLazyMotion\b/, 'LazyMotion fuera de la raíz')).toEqual([]);
  });
});
