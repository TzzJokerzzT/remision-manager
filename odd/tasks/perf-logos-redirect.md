# Feature: Performance — imágenes de Cloudinary, redirect raíz y dependencia muerta

## Goal

Ejecutar los tres ítems de performance de bajo esfuerzo y alto impacto del review medido,
sin tocar Framer Motion (decisión explícita del usuario: se conserva).

**Estado: completa.** Rama `feat/perf-logos-redirect`, **stacked** sobre
`feat/remision-retencion-frontend` (ahí vive el runner `bun test` y ahí se había modificado
`RemisionDocument.tsx`).

## Baseline medido (build de producción, gzip, sin el chunk de polyfills)

| Ruta | JS gz antes | JS gz después |
| ---- | ----------- | ------------- |
| `/` | **222.8 KiB** | **0** (ƒ dinámica, sin HTML prerenderizado) |
| `/dashboard` | 321.9 KiB | 322.2 KiB |
| `/login` | 390.8 KiB | 390.5 KiB |
| `/dashboard/remisiones` | 501.2 KiB | 501.6 KiB |
| `/dashboard/companies` | 450.2 KiB | 450.8 KiB |

Las variaciones de ±0.6 KiB en el resto son ruido por re-hash de chunks: el helper añade una
función pura pequeña y no hay regresión de JS.

## Restricción de diseño descubierta

La autenticación vive **solo en `localStorage`** (`auth.store` con `persist` +
`core/infrastructure/storage/tokenStorage.ts`). No hay cookie, así que el servidor **no puede**
saber si el usuario está autenticado. Un `redirect()` a ciegas en `/` habría cambiado el
comportamiento del deslogueado (un salto extra y ~99 KiB gz de más).

Solución: cookie de hint de ruteo (`remisiones_session=1`), explícitamente **no autoritativa**.
No es una credencial, no la consulta ningún gate: el control real sigue en la API (validación
del token) y en `ProtectedShell`. Rancia o falseada, el peor caso es un salto a `/dashboard`
que rebota a `/login` y se autocorrige.

## Tasks

| # | Task | Status | Evidence |
| - | ---- | ------ | -------- |
| 1 | Helper puro `cloudinaryImageUrl` + tests (test-first) | done | `f26fc87`; RED observado → GREEN 10 casos |
| 2 | Aplicar el helper en avatares, PDF y preview | done | `35938a9` (3 sitios; el preview del Dropzone se dejó por redundante) |
| 3 | `/` server-side: cookie de hint + `redirect()` + limpieza | done | `1c57e1d`; el build reporta `/` como ƒ |
| 4 | Eliminar `pdf-lib` y alinear el lockfile | done | `f80fd3e`; `--frozen-lockfile` sin cambios |
| 5 | Verificación y remedición | done | ver abajo |

## Verification evidence

- `bun test` → **15 pass / 0 fail** (5 previos de totales + 10 nuevos del helper).
- RED real observado antes de implementar: `SyntaxError: Export named 'cloudinaryImageUrl' not found`.
- `bun run typecheck` → `tsc --noEmit` sin errores.
- `bunx biome check` sobre lo tocado → limpio. Sobre el proyecto entero quedan **exactamente**
  los mismos hallazgos preexistentes (`Dropzone.tsx:124` error a11y, `Toast.tsx:41` warning):
  ninguna regresión introducida.
- `bun run build` → OK; `/` figura como **ƒ (Dynamic)**, y `.next/server/app/index.html` **ya no
  existe** (la raíz dejó de prerenderizarse).
- `bun install --frozen-lockfile` → "no changes" y `bun.lock` byte-idéntico antes y después:
  lock y `package.json` coinciden.

### Qué prueba cada cosa, y qué no

- **`/` en 0 JS**: prueba estructural (ruta dinámica + ausencia de HTML prerenderizado).
- **Logos**: probado a nivel de URL de entrega por los 10 tests. La magnitud del ahorro depende
  del peso real de cada logo subido (un logo de 2 MB ahora entrega unos pocos KB).
- **`pdf-lib`**: prueba a nivel de instalación (fuera de `package.json` y del lock, lock consistente).
- **No verificado**: bytes reales de imagen en un navegador y navegación end-to-end. No hay
  harness de browser en el proyecto.

## Aclaración sobre el lockfile

`bun.lock` traía un cambio **preexistente y ajeno** que ya fue aprobado en la lineage del
workspace: quitaba el obsoleto `@pdfslick/react` (y sus `@napi-rs/canvas-*`, `pdfjs-dist`) y
agregaba `@vercel/analytics`, alineando el lock con `package.json`. Como `bun remove pdf-lib`
se apoya en ese estado, los dos cambios no se pueden separar limpio: el refresh viaja en
`f80fd3e`, **declarado explícitamente** en el mensaje del commit en vez de barrido en silencio.
`.gitignore` y `.atl/*` siguen sin tocar.

## Non-goals

- **Framer Motion intacto** (pedido explícito). Los ítems 4, 5, 6, 8 y 9 del review quedan fuera.
- No se cambia el mecanismo de autenticación ni dónde vive el token.
- Push, PR y merge: decisión del usuario.
