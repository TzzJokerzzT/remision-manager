# Feature: Remisión — documentType y retención en la fuente (frontend)

## Goal

Alinear el frontend de remisiones con el contrato ya implementado en `remisiones-backend`
(commits `140329c` y `bc47d7c`): `documentType`, `hasRetencion`, `retencionPercentage`,
`retencionValue`, y `total = subtotal + ivaValue - retencionValue`.

**Estado: completa.** Rama `feat/remision-retencion-frontend` (base `production` @ `8af50ac`).

## Backend contract (source of truth)

- `src/domain/entities/Remision.ts`: `DocumentType = 'remision' | 'orden_compra' | 'cotizacion`,
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
- `RemisionList.handleSubmit` descartaba `type` del payload de update.
- Sin runner de tests en `package.json`; se usa `bun test` nativo (bun 1.4.2).

## Tasks

| # | Task | Status | Evidence |
| - | ---- | ------ | -------- |
| 1 | Capa de contrato: `Remision` entity + `IRemisionRepository` payloads | done | commit `fd361dd` |
| 2 | Util puro `remisionTotals` + tests (test-first) | done | commit `fd361dd`; RED observado (módulo inexistente) → GREEN `5 pass / 0 fail` |
| 3 | Schema Zod del formulario con retención y `documentType` | done | commit `fd361dd`; defaults `documentType='remision'`, `hasRetencion=false` + 2 refinements |
| 4 | `RemisionForm`: selector `documentType`, switch de retención, totales | done | commit `fd361dd`; typecheck y build limpios |
| 5 | `RemisionList`: `cleanPayload`, PATCH con `type`/retención, defaults de edición | done | commit `fd361dd`; ya no descarta `type` |
| 6 | Superficies de lectura: `RemisionCard`, `RemisionDetail`, `RemisionDocument` (PDF) | done | commit `ffcb13e` |
| 7 | Verificación y cierre | done | ver abajo |

Corrección posterior exigida por el review: commit `0c484a0` (3 líneas de diff declaradas y
respetadas).

## Verification evidence

- `bun test` → `5 pass / 0 fail` (5 casos: retención + IVA, retención sin porcentaje,
  porcentaje obsoleto con retención apagada, `quantity_only`, redondeo `round2`).
- `bun run typecheck` → `tsc --noEmit`, sin errores.
- `bunx biome check` sobre los archivos tocados → sin fixes.
- `bun run build` (Next 16.2.9 / Turbopack) → `✓ Compiled successfully in 32.8s`, 12/12 páginas.
- Verificación independiente (`gentle-ai-verify`) sobre `production...HEAD`: 7/7 claims PASS
  (POST con retención, PATCH apagando retención conservando el porcentaje, PATCH cambiando
  `type`, invariantes del schema, paridad de la fórmula de totales, render condicionado de la
  retención, sin rutas residuales con el contrato viejo).
- Deuda preexistente, ajena a este diff: `biome check .` falla en `Dropzone.tsx:124`
  (`a11y/useSemanticElements`) y advierte en `Toast.tsx:41`; la base `production` falla igual.

## Review outcome (RDD on)

| Lineage | Candidato | Resultado |
| ------- | --------- | --------- |
| `review-aa88f105e0b1905a` | rango commiteado `production..ffcb13e` (12 archivos / 347 líneas) | **abandonada** (`operator_disposition`) |
| `review-4af2ec987d965e0f` | cambios sueltos del workspace (`.atl/*`, `.gitignore`, `bun.lock`; 4 archivos / 46 líneas) | **approved + acknowledged**, autoridad quemada (`gentle-ai.review-acknowledged/v1`) |

Secuencia de la primera lineage: lente `review-reliability` admitida → 1 hallazgo BLOCKER
`R3-001` → refuter lo marcó `corroborated` → plan de corrección de 3 líneas → corrección
aplicada y commiteada → stop terminal `captured_artifacts_unverifiable` → abandono autorizado.

**`R3-001` es un falso positivo.** Afirmaba que el switch recibía un `ChangeEvent` nativo.
Los tipos instalados dicen lo contrario: `SwitchFieldProps extends AriaSwitchProps` y
`ToggleProps.onChange?: (isSelected: boolean) => void`
(`react-stately/dist/types/src/toggle/useToggleState.d.ts:15`), sin `onValueChange` en
react-aria-components 1.19.0. La "corrección" aplicada no era un bug fix sino un
endurecimiento defensivo del contrato booleano (`isSelected === true` al leer y al escribir).

Hallazgos advisory de la segunda lineage (ninguno bloqueante, ninguno reabre el review):
`R3-cloudflare-skill-added`, `R3-gitignore-atl`, `R3-lockfile-dependency-change`,
`R3-registry-cache-dropped-newline`, `R3-registry-refresh-comment`,
`R3-removed-hermes-skill-source`.

## Environment fix applied

`~/.pi/gentle-ai/models.json` no tenía entradas para los roles host-mediated del provider, y
STATUS los exige (`extensions/gentle-ai.ts:6855` lee el routing solo de `models.json`, no del
frontmatter del agente). Se agregaron, de forma aditiva:

- `review-refuter` → `opencode-go/deepseek-v4-pro`, `thinking: high`
- `review-validator` → `opencode-go/deepseek-v4-flash`, `thinking: high`

Descartado: `gentle-ai sync` no crea estos roles, y un `review-refuter.md` en
`~/.pi/agent/agents/` no los resuelve (se eliminó el archivo de prueba).

## Non-goals

- No se toca el backend.
- Push, PR y merge quedan a decisión del usuario.
