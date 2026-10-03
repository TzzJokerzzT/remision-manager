'use client';

import { AnimatePresence, m } from 'framer-motion';
import type { AnimatedListProps } from '../utils/types';

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <m.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.04 } },
      }}
    >
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </m.div>
  );
}

export const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};
