/**
 * Punto de corte para las features de animación de framer-motion.
 *
 * Existe como módulo aparte **a propósito**: es lo que permite que el bundler ponga
 * las features en su propio chunk. Importar `domAnimation` directamente desde
 * `framer-motion` en el provider las dejaría en el bundle inicial y no habría nada
 * que diferir.
 *
 * El patrón es el que documenta framer-motion:
 *   const loadFeatures = () => import('./motionFeatures').then((mod) => mod.domAnimation)
 */
export { domAnimation } from 'framer-motion';
