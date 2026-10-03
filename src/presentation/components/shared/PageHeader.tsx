'use client';

import { domAnimation, LazyMotion, motion } from 'framer-motion';
import type { PageHeaderProps } from '../utils/types';

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-foreground/60">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </motion.div>
    </LazyMotion>
  );
}
