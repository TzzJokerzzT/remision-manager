# Feature: IVA por ítem + columna de IVA en el PDF

## Goal

Adaptar el frontend al nuevo contrato del backend, donde **el IVA dejó de ser global y pasó a
ser por producto**, y mostrar en el PDF una columna de IVA por producto con los totales
recalculados.

Rama `feat/remision-iva-product`, basada en `development` (que ya incluye el merge del PR #1
con todo el trabajo anterior: retención, perf, gates de calidad y LazyMotion). `production`
todavía está en `8af50ac`, así que la base de esta feature es `development`.

## Contrato real del backend (verificado en el repo, no inferido)

- `RemisionItem` ahora es `{ description, quantity, unitPrice?, hasIva?, ivaPercentage?, ivaValue? }`.
- `itemSchema` del backend exige **`hasIva: z.boolean()` obligatorio** en cada ítem, para
  `priced` **y** para `quantity_only`.
- Refinamientos por ítem (`refineItemIva`):
  - `hasIva === true` → `ivaPercentage` requerido y **> 0**;
  - `hasIva === false` → `ivaPercentage` debe estar **ausente o ser 0**.
- **`ivaPercentage` a nivel raíz ya no existe**: fue reemplazado por `ivaValue` (opcional).
- `ivaValue` raíz se **valida** contra el calculado: si difiere, el backend responde 400
  (`ivaValue no coincide con el valor calculado`).
- `computeRemisionTotals(items, type, hasRetencion?, retencionPercentage?)`:
  - `quantity_only` → los cuatro campos en `undefined` y los ítems se devuelven **sin**
    `ivaValue` (se elimina si venía);
  - `subtotal = Σ(cantidad × precio)` **antes de IVA**;
  - por ítem con `hasIva === true`: `ivaValue = round2(cantidad × precio × tasa/100)`; con
    `hasIva === false` el `ivaValue` del ítem se **elimina**;
  - `ivaValue` raíz = **suma de los IVA por ítem**, redondeada;
  - `retencionValue` sigue calculándose sobre el **subtotal**;
  - `total = subtotal + ivaValue − retencionValue`;
  - `round2` es `Number(value.toFixed(2))`, **no** `Math.round`.
- Rechaza (422) ítems `priced` sin `hasIva`, y `unitPrice` negativo.

## Decisiones del usuario

| Decisión | Elección |
| -------- | -------- |
| ¿Mandar `ivaValue` raíz? | **No** — es opcional y el backend lo calcula; enviarlo agrega un modo de fallo por redondeo |
| Columna de IVA en el PDF | **Solo el valor** del IVA por producto |

## Decisiones de diseño propias

1. **IVA por ítem con default 19%**: cada ítem nuevo arranca en `hasIva: true` con
   `ivaPercentage: 19`, editable, y se puede apagar.
2. **Para `quantity_only` el payload manda `hasIva: false` sin `ivaPercentage`**: el DTO del
   backend exige el campo, y con `hasIva: true` exigiría un porcentaje > 0 que en ese tipo no
   aplica. El formulario **conserva** la configuración por ítem en su estado, así al volver a
   `priced` se recupera (mismo criterio que la retención).
3. **Migración de remisiones viejas**: los ítems creados antes de este cambio **no tienen
   `hasIva`**, y el backend los rechaza (`Cada item debe incluir hasIva`). Al editarlas o
   mostrarlas hay que inferirlo. Se infiere de los datos ya guardados: si la remisión tiene
   `ivaValue > 0`, la tasa implícita es `ivaValue / subtotal × 100` (exacta cuando la remisión
   vieja tenía una sola tasa), y si es 0, los ítems van sin IVA. Un helper puro hace esa
   inferencia y se usa en los tres lugares donde aparecen ítems viejos: defaults de edición,
   PDF y detalle web. Sin esto, editar una remisión vieja falla con 400 o cambia sus totales
   en silencio.

## Tasks

| # | Task | Status | Evidence |
| - | ---- | ------ | -------- |
| 1 | Contrato: ítem en la entidad + schema con los dos refinamientos, sin `ivaPercentage` raíz | done | `0519740` |
| 2 | `remisionTotals` por ítem, espejando el backend (incluido `round2` con `toFixed`) | done | `0519740`; test-first con 8 casos en RED |
| 3 | Helper de migración para ítems sin `hasIva` + tests | done | `0519740`; 7 casos |
| 4 | `RemisionForm`: control de IVA por ítem, sin campo global, preview de totales | done | `0519740` |
| 5 | `cleanPayload` y defaults de edición | done | `0519740` |
| 6 | PDF: columna de IVA por producto y totales | done | `ece0117` |
| 7 | Detalle web: IVA por producto y totales | done | `ece0117` |
| 8 | Actualizar los tests existentes y agregar cobertura nueva | done | `0519740`; el body de ejemplo del usuario quedó anclado como test |
| 9 | Verificación integral (tests, typecheck, biome, build) | done | ver abajo |

## Resultado

- **32 suites / 215 tests** (venían 32/193): +22 casos, incluidos los fixtures copiados del
  backend y el ejemplo del usuario.
- `bun run typecheck`, `bun run check` y `bun run build` limpios.
- Dos work units: `0519740` (contrato, lógica, formulario y payload) y `ece0117` (PDF y detalle).
- Limpieza: se eliminó el `ivaPercentage` raíz, ya muerto, de la entidad y de los dos payloads
  del repositorio.

## Qué probó cada cosa

- **El redondeo coincide con el backend**: los fixtures de `remisionTotals.test.ts` se copiaron
  de su test, incluido el caso que distingue redondear-por-ítem-y-sumar de sumar-y-redondear.
- **La migración de datos viejos** tiene 7 casos: tasa recuperada, tasa no estándar, sin IVA,
  ítems que ya declaran `hasIva`, ausencia de totales y división por cero.
- **El contrato del backend** quedó anclado con el body de ejemplo del usuario como test, más
  los dos refinamientos de coherencia por ítem.
- **No verificado**: el render real del PDF en un navegador (no hay harness de browser); la
  columna se verificó por tipos, build y revisión del markup.

## Verification plan

- Los fixtures del frontend se copian de los tests del backend (`remisionTotals.test.ts`),
  incluido el caso "redondea por ítem y después suma" (dos ítems de 1×0,19 al 19% → 0,04 cada
  uno, 0,08 total), para que el redondeo no se desvíe.
- `bun run typecheck`, `bun run check`, `bun run test`, `bun run build`.
- Comparación explícita del payload generado contra el ejemplo del usuario.

## Non-goals

- No se manda `ivaValue` raíz (decisión del usuario).
- No se toca el backend.
- No se cambia la retención, que sigue sobre el subtotal.
- Push, PR y merge: decisión del usuario. Ojo: la pila de ramas ya tiene 5 niveles.
