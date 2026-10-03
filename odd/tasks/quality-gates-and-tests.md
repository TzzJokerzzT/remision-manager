# Feature: Gates de calidad (CI estricto, hooks de husky) y tests unitarios

## Goal

Cerrar el hueco más grande del proyecto: no había ninguna barrera automática que impidiera
entrar código roto, y solo existían 2 archivos de test.

**Estado: completa.** Rama `feat/perf-logos-redirect` (stacked sobre la de retención).

## Decisiones del usuario (antes de escribir)

| Decisión | Elección |
| -------- | -------- |
| Runner de tests | **Jest 30**, migrando los 15 tests de `node:test` (sin dos runners) |
| Alcance de los tests | **Lógica + componentes con lógica**, no los 43 archivos |
| Deploy | **Solo gate estricto**, sin deploy ni secretos |

## Resultado medido

| Métrica | Antes | Después |
| ------- | ----- | ------- |
| Archivos de test | 2 | **30 suites** |
| Casos | 15 | **190** |
| Cobertura (statements) | 2.99% (42/1402) | **37.44% (525/1402)** |
| Barrera automática | ninguna | hooks + CI |
| Costo del `pre-push` | — | **83 s** (tsc ~11s, biome <1s, build ~70s) |

## Tasks

| # | Task | Status | Evidence |
| - | ---- | ------ | -------- |
| 1 | Dejar el proyecto lint-limpio (bloqueante del CI) | done | `8096423` |
| 2 | husky a devDependencies + deps de test y commitlint | done | `097ee49` |
| 3 | Setup de Jest (jsdom + Testing Library) y migrar los 15 tests | done | `097ee49` |
| 4 | Hooks `commit-msg` y `pre-push` | done | `533a555` |
| 5 | CI estricto en GitHub Actions | done | `7e40d3b` |
| 6 | Tests de lógica (DTOs, utils, stores, repositorios, httpClient, use cases) | done | `30e4c94`, `22479d3`, `7814590` |
| 7 | Tests de componentes con lógica | done | `3d17607`, `6b2035f` |
| 8 | Verificación integral y medición | done | secuencia del CI completa en verde |

## El bloqueo real: HeroUI es ESM-only

`@heroui/react` declara `"type": "module"` y su `exports["."]` expone **solo** `import` y
`types`, sin `require`. El resolver de Jest trabaja con condiciones de CommonJS y no lo
encuentra. `next/jest` además **concatena** sus propios patrones de `node_modules`
—incluido uno con soporte de pnpm que matchea la ruta real del paquete—, así que ningún
patrón posterior puede excluirlo. Resultado: `Must use import to load ES Module`.

Se intentaron y **no** alcanzaron: `customExportConditions: ['']`, y `moduleNameMapper` al
`dist/index.js` (la resolución pasa, la ejecución no). `require('@heroui/react')` en Node 26
falla con `ERR_PACKAGE_PATH_NOT_EXPORTED`, así que tampoco es un problema de `require(esm)`.

Solución: `__mocks__/@heroui/react.tsx`, un doble que renderiza HTML semántico real
(`button`, `table`, `input[role=switch]`, y un `Select` interactivo cuyo trigger muestra el
label de la opción elegida).

**Costo, dicho de frente**: el doble **no** puede validar la API de HeroUI. Si un componente
se cablea mal contra la librería, este archivo no lo detecta, porque su comportamiento es el
que definimos nosotros. De eso siguen respondiendo `bun run typecheck` y `bun run build`
contra la librería real —así se refutó el falso positivo `R3-001`— y lo verdaderamente visual
corresponde a una prueba de navegador, fuera de alcance.

## Hallazgos de los tests (bugs reales, documentados con `TODO(bug)`)

1. `src/core/application/dtos/remision.dto.ts:23-29` — el refinamiento "Cada ítem debe tener
   un precio unitario…" es **inalcanzable**: `valueAsNumber` produce `NaN` y `z.number()`
   falla antes con "Invalid input: expected number, received NaN". Mensaje muerto.
2. `src/core/application/dtos/auth.dto.ts:24` — el password de login solo exige `min(1)`: una
   contraseña de un carácter pasa; solo se rechaza vacío.
3. `src/core/infrastructure/repositories/{Remision,Client,Driver}Repository.ts` — `companyId`
   no se recorta, mientras que el resto de los filtros de texto sí.

Corrección durante la revisión: el `TODO(bug)` sobre `cleanPayload` enviando siempre
`retencionPercentage` estaba **mal**. Es deliberado (el backend conserva el porcentaje como
configuración al apagar la retención), y ahora el comentario lo explica para que nadie lo
"arregle" y pierda ese comportamiento.

## Verificación

- Secuencia completa del CI, cada paso con `exit=0`: `bun install --frozen-lockfile`,
  `typecheck`, `check`, `test --ci --coverage`, `build`.
- Hooks probados ejecutándolos: un mensaje `"mensaje malo sin tipo"` es rechazado por
  `commit-msg` con `subject-empty` y `type-empty`, y no crea commit; `sh .husky/pre-push`
  termina en 0 en 83 s.
- `biome check --error-on-warnings`: 143 archivos sin errores ni warnings.

## Deuda pendiente y huecos declarados

- **El `pre-push` NO corre tests**: el pedido fue explícito en el orden typecheck → linter →
  build. Los tests sí corren en CI. Agregarlos al hook es una línea en `.husky/pre-push`.
- **Sin umbral de cobertura**: 37.44% con 30 suites; un umbral hoy sería arbitrario o
  bloquearía todo. Se recolecta y se sube como artefacto.
- **`src/shared/config/env.ts` sigue con el `apiUrl` hardcodeado a localhost** (cambio
  pendiente del usuario, no tocado). Si se commitea, producción apunta a localhost.
- La cola de refresh single-flight del `httpClient` no está cubierta (necesita dos 401
  concurrentes para ser determinista).
- Deuda preexistente de a11y (`Dropzone`) ya resuelta en `8096423`; el resto del review de
  a11y sigue sin hacerse.
- Push, PR y merge: decisión del usuario. La rama está **stacked**.
