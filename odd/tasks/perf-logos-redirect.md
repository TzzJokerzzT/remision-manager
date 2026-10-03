# Feature: Performance — imágenes de Cloudinary, redirect raíz y dependencia muerta

## Goal

Ejecutar los tres ítems de performance de bajo esfuerzo y alto impacto del review medido,
sin tocar Framer Motion (decisión explícita del usuario: se conserva).

Rama `feat/perf-logos-redirect`, **stacked** sobre `feat/remision-retencion-frontend`
(necesaria: ahí vive el runner `bun test` y ahí se modificó `RemisionDocument.tsx`).

## Baseline medido (build de producción, gzip, ya descontado el chunk de polyfills)

| Ruta | JS gz antes |
| ---- | ----------- |
| `/` | 222.8 KiB |
| `/dashboard` | 321.9 KiB |
| `/dashboard/remisiones` | 501.2 KiB |

Hallazgos que ataca esta feature (ver `mem: remision-frontend/performance-baseline`):

1. Los logos de Cloudinary se sirven **sin transformaciones** (`secure_url` tal cual) vía
   `Avatar.Image` (un `<img>` normal). Un logo de 2 MB se descarga entero en una lista de 10 filas.
2. `app/page.tsx` es un client component entero (zustand + spinner + `useEffect` +
   `router.replace`) solo para decidir el destino: 222.8 KiB gz de JS.
3. `pdf-lib` figura en `dependencies` y no se usa en ningún lado.

## Restricción de diseño descubierta

La autenticación vive **solo en `localStorage`** (`auth.store` con `persist` +
`core/infrastructure/storage/tokenStorage.ts`). No hay cookie, así que el servidor **no puede**
saber si el usuario está autenticado. Un `redirect()` a ciegas en `/` cambiaría el
comportamiento para el usuario deslogueado (pagaría un salto extra y ~99 KiB gz de más).

Solución: una **cookie de hint de ruteo** (`remisiones_session=1`), explícitamente **no
autoritativa**. No es una credencial, no la lee ningún gate: el control real sigue en la API
(validación de token) y en `ProtectedShell`. Si está rancia o falseada, el peor caso es un
salto a `/dashboard` que rebota a `/login` y se autocorrige.

## Tasks

| # | Task | Status | Evidence |
| - | ---- | ------ | -------- |
| 1 | Helper puro `cloudinaryImageUrl` + tests (test-first) | pending | — |
| 2 | Aplicar el helper en los sitios de render (avatares, PDF, preview) | pending | — |
| 3 | `/` server-side: cookie de hint + `redirect()` + limpieza | pending | — |
| 4 | Eliminar `pdf-lib` y dejar el lockfile consistente | pending | — |
| 5 | Verificación (tests, typecheck, biome, build) y medición del después | pending | — |

## Verification plan

- `bun test` sobre el helper: RED antes de implementarlo, GREEN después, con los casos de
  URL con versión, transformación previa, host ajeno, `blob:`/`data:`, vacío y `/image/upload/`.
- `bun run typecheck` y `bunx biome check` sobre lo tocado.
- `bun run build` y **remedición del HTML prerenderizado de `/`**: debe dejar de referenciar
  chunks de ruta (queda solo el piso compartido).
- Consistencia del lock: el lockfile debe quedar alineado con `package.json`.

## Non-goals

- **No se toca Framer Motion** (el usuario pidió conservarlo). Los ítems 4, 5, 6, 8 y 9 del
  review quedan fuera.
- No se cambia el mecanismo de autenticación ni dónde vive el token.
- Push, PR y merge: decisión del usuario.
