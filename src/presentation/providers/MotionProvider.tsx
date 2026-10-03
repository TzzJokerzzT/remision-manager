'use client';

import { LazyMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Carga perezosa de las features de animación, montada UNA sola vez en la raíz.
 *
 * Cómo funciona la carga perezosa de framer-motion, porque es fácil equivocarse:
 * el componente `motion` (el que se usa como `motion.div`) trae las features
 * incluidas de forma estática en el bundle; el componente `m` (usado como `m.div`)
 * no las trae y las pide a este provider. Por eso el par correcto es
 * `LazyMotion` + `m`: con `motion` adentro, `LazyMotion` no tiene nada que diferir
 * y encima se suma el peso de `domAnimation`.
 *
 * `strict` convierte ese error en un fallo ruidoso en vez de una regresión de peso
 * silenciosa: si un `motion.*` aparece dentro de este árbol, framer-motion tira un
 * error que explica el problema. Va activo fuera de producción para que también
 * cubra los tests y el desarrollo, y apagado en producción por si el chequeo no
 * estuviera contemplado ahí.
 *
 * `@heroui/react` no depende de framer-motion (0 referencias en su bundle), así que
 * `strict` no puede dispararse por un componente de la librería.
 */
const loadFeatures = () => import('./motionFeatures').then((mod) => mod.domAnimation);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict={process.env.NODE_ENV !== 'production'}>
      {children}
    </LazyMotion>
  );
}
