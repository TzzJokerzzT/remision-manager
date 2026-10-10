import { Spinner } from '@heroui/react';

export function ViewerSkeleton() {
  return (
    <div className="border-default-200 bg-default-100 dark:bg-default-50/5 flex h-[70vh] items-center justify-center rounded-2xl border">
      <Spinner />
    </div>
  );
}
