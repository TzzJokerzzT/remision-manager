'use client';

import { AnimatePresence, domAnimation, LazyMotion, motion } from 'framer-motion';
import type { AnimatedListProps } from '../utils/types';

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        className={className}
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.04 } },
        }}
      >
        <AnimatePresence mode="popLayout">{children}</AnimatePresence>
      </motion.div>
    </LazyMotion>
  );
}

export const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};
