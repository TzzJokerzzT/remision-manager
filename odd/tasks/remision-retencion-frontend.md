# Feature: Remisión — documentType y retención en la fuente (frontend)

## Goal

Alinear el frontend de remisiones con el contrato ya implementado en `remisiones-backend`
(commits `140329c` y `bc47d7c`): `documentType`, `hasRetencion`, `retencionPercentage`,
`retencionValue`, y `total = subtotal + ivaValue - retencionValue`.

## Backend contract (source of truth)

- `src/domain/entities/Remision.ts`: `DocumentType = 'remision' | 'orden_compra'`,
  `hasRetencion: boolean`, `retencionPercentage?`, `retencionValue?`.
- `src/application/dtos/remision.dto.ts`: `documentType` con default `'remision'`;
  `hasRetencion` default `false`; `retencionPercentage` 0–100 requerido cuando
  `hasRetencion === true`. En `updateRemisionSchema` todo es opcional e incluye
  `type` y `documentType`.
- `src/domain/services/remisionTotals.ts`: `quantity_only` devuelve los cuatro campos
  calculados en `undefined`; con retención, `retencionValue = subtotal * pct / 100` y
  `total = subtotal + ivaValue - retencionValue`.
- PATCH: `undefined` explícito se traduce a `$unset`; `type` se resuelve como
  `dto.type ?? remision.type`; si se apaga la retención, `retencionValue` desaparece de la
  respuesta y `retencionPercentage` se conserva como valor de configuración.

## Baseline (pre-fix)

- `grep` de `retencion` y `documentType` en `src/`: cero resultados.
- `RemisionList.handleSubmit` descarta `type` del payload de update.
- Sin runner de tests en `package.json`; se usa `bun test` nativo (bun 1.4.2).

## Tasks

| # | Task | Status | Evidence |
| - | ---- | ------ | -------- |
| 1 | Capa de contrato: `Remision` entity + `IRemisionRepository` payloads | pending | — |
| 2 | Util puro `remisionTotals` + tests `bun test` (test-first) | pending | — |
| 3 | Schema Zod del formulario con retención y `documentType` | pending | — |
| 4 | `RemisionForm`: selector `documentType`, switch de retención, preview de totales | pending | — |
| 5 | `RemisionList`: `cleanPayload`, PATCH con `type`/retención, defaults de edición | pending | — |
| 6 | Superficies de lectura: `RemisionCard`, `RemisionDetail`, `RemisionDocument` (PDF) | pending | — |
| 7 | Verificación (typecheck, biome, bun test) y cierre | pending | — |

## Verification plan

- `bun test` (nuevo) para la fórmula de totales: RED antes de `remisionTotals.ts`, GREEN después.
- `bun run typecheck` sobre todo el proyecto.
- `bunx biome check` sobre los archivos tocados.
- Test-first no aplica al UI/PDF (no hay DOM de test en el proyecto); verificación estructural
  por tipos + revisión de render.

## Non-goals

- No se toca el backend.
- No se cambia el diseño de la tabla/listado ni la paginación.
- Push, PR y merge quedan a decisión del usuario.
