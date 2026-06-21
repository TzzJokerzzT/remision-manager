# Remisiones Frontend

Aplicación Next.js para el generador de remisiones (con precio + IVA, o solo cantidad). Construida con **Bun + Next.js 16 (App Router) + TypeScript**, siguiendo **Clean Architecture**, consumiendo el backend Express/MongoDB del mismo proyecto.

## Stack

- **Runtime:** Bun
- **Framework:** Next.js 16 (App Router)
- **UI Kit:** HeroUI v3 (basado en React Aria + Tailwind v4)
- **Estilos:** Tailwind CSS v4, modo claro/oscuro con `next-themes`
- **Estado global:** Zustand (sesión, empresa seleccionada)
- **Datos remotos:** TanStack Query + Axios (con interceptor de refresh token)
- **Formularios:** React Hook Form + Zod
- **Animaciones:** Framer Motion
- **Lint/Format:** Biome
- **Tipado:** TypeScript estricto

## Arquitectura (Clean Architecture)

```
src/
  core/
    domain/             → Entidades + interfaces de repositorio (contratos, sin dependencias)
      entities/
      repositories/
    application/        → Casos de uso + DTOs Zod (reglas de negocio de UI)
      use-cases/
      dtos/
    infrastructure/      → Axios, localStorage, implementaciones concretas de repos
      http/
      repositories/
      storage/
    di/                 → Contenedor de inyección de dependencias
  presentation/         → Todo lo relacionado a React/Next
    components/         → ui/ (genéricos HeroUI), layout/, shared/
    features/           → auth/, companies/, clients/, drivers/, profile/ (componentes + hooks por dominio)
    providers/          → Theme, Query, Auth (hidratación de sesión)
    stores/             → Zustand: auth.store, company.store
  shared/               → config (env), constants (queryKeys), utils
app/                    → Rutas de Next.js (App Router), consumen `presentation/`
```

La regla de dependencia es la misma que en el backend: `domain` no depende de nada; `application` depende solo de `domain`; `infrastructure` y `presentation` dependen hacia adentro, nunca al revés. Los componentes de `app/` son delgados: solo componen features de `presentation/features`.

## Autenticación y rutas protegidas

- El `AuthProvider` (en `presentation/providers`) hidrata la sesión al cargar la app: si hay un `accessToken` en `localStorage`, llama a `GET /users/me` para validar la sesión y poblar el store de Zustand.
- `httpClient` (Axios) intercepta respuestas `401`: intenta refrescar el token automáticamente vía `/auth/refresh` y reintenta la petición original. Si el refresh falla, limpia la sesión y redirige a `/login`.
- Las rutas bajo `app/dashboard/**` están envueltas por `ProtectedShell`, que redirige a `/login` si no hay sesión activa.
- Los tokens se guardan en `localStorage` (no en cookies), por lo que la protección de rutas es a nivel de cliente (React), no de middleware de Next.js. Es una decisión consciente para mantener el flujo simple tipo SPA; si se requiere protección a nivel de servidor/SEO, se puede migrar a cookies httpOnly seteadas por el backend.

## Selección de empresa activa

`useCompanyStore` (Zustand, persistido en `localStorage`) guarda la empresa actualmente seleccionada. El selector está disponible en el `Topbar` y en la vista de Empresas. Clientes y Conductores se filtran automáticamente por la empresa activa.

## Configuración

```bash
cp .env.example .env.local
# Edita NEXT_PUBLIC_API_URL para apuntar a tu backend (por defecto http://localhost:3000/api)
```

## Instalación y ejecución

```bash
bun install
bun run dev          # desarrollo
bun run build        # build de producción
bun run start        # servir build de producción
bun run typecheck    # tsc --noEmit
bun run check         # biome check (lint + format)
bun run check:fix     # biome check --write
```

## Features implementadas

- **Login / Registro** con validación Zod + React Hook Form.
- **Perfil de usuario**: nombre y logo de empresa (URL), usado como avatar en la interfaz.
- **Empresas**: CRUD completo (crear, listar, editar, eliminar) + selector de empresa activa.
- **Clientes**: CRUD completo, asociado a una empresa, filtrable por empresa activa.
- **Conductores**: CRUD completo, mismo patrón que clientes.
- **Remisiones**: CRUD completo con ítems dinámicos, cálculo de subtotal/IVA/total en vivo, y vista de **detalle/impresión** que genera un PDF en el navegador (`pdf-lib`) y lo previsualiza con **PDFSlick** (zoom, navegación de páginas, descarga).
- **Modo claro/oscuro** persistente vía `next-themes`.
- **Diseño responsive**: sidebar colapsable en móvil, grids adaptables.
- **Animaciones** sutiles con Framer Motion en listados, modales y transiciones de página.

## Generación e impresión de remisiones (PDFSlick)

La ruta `/dashboard/remisiones/[id]` arma el PDF de la remisión **100% en el cliente**, sin tocar el backend:

1. `pdf/generateRemisionPdf.ts` construye el documento con `pdf-lib` (membrete de empresa, datos de cliente/conductor, tabla de ítems con paginación automática, totales, espacio de firmas).
2. `pdf/useRemisionPdf.ts` regenera el PDF (como `ArrayBuffer`) cada vez que cambian los datos de la remisión.
3. `pdf/RemisionPdfViewer.tsx` renderiza ese `ArrayBuffer` con `usePDFSlick()` de `@pdfslick/react`, con una toolbar propia (zoom, paginación, descarga vía `pdfSlick.downloadOrSave()`).
4. El componente del visor se carga con `next/dynamic({ ssr: false })` porque PDFSlick (basado en PDF.js) depende de APIs del navegador (`canvas`, Web Worker) que no existen en el servidor.

No se requiere configuración manual del worker de PDF.js: `@pdfslick/core` lo resuelve automáticamente vía `import.meta.url`, y Next.js lo empaqueta solo (se puede verificar en `.next/static/media/pdf.worker.*.mjs` tras el build).

## Notas de diseño sobre HeroUI v3

HeroUI v3 es un kit "headless-friendly" basado en React Aria Components con sub-componentes compuestos (`Select.Root`, `Select.Trigger`, `Modal.Root`, etc.). Se construyeron wrappers reutilizables en `presentation/components/ui/` (`AppSelect`, `FormModal`, `ConfirmDialog`, `FormField`) para no repetir esa composición en cada formulario.
