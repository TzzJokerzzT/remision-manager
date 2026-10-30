'use client';

import { ListBoxItemRoot, ListBoxRoot, Select } from '@heroui/react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AppSelectOption, AppSelectProps } from '../utils/types';

export function AppSelect({
  label,
  placeholder = 'Selecciona una opción',
  options,
  selectedKey,
  onSelectionChange,
  isInvalid,
  errorMessage,
  isDisabled,
  fullWidth = true,
  className,
  onLoadMore,
  isLoadingMore = false,
  hasMore = false,
}: AppSelectProps) {
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  // El popover de react-aria no monta su contenido hasta abrirlo, así que el centinela
  // aparece recién ahí: por eso el nodo vive en estado (callback ref) y no en un useRef.
  // Con un ref, el efecto corría con `null` y el observer nunca se creaba.
  useEffect(() => {
    if (!sentinel || !onLoadMore || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, onLoadMore, hasMore, isLoadingMore]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-foreground/80">{label}</span>}
      <Select.Root<AppSelectOption, 'single'>
        items={options as unknown as Iterable<AppSelectOption, 'single'>}
        fullWidth={fullWidth}
        selectedKey={selectedKey}
        onSelectionChange={(key) => onSelectionChange(key as string | null)}
        isDisabled={isDisabled}
        placeholder={placeholder}
        className={className}
      >
        <Select.Trigger
          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
            isInvalid ? 'border-danger' : 'border-default-200'
          } bg-background hover:border-default-300 data-[disabled]:opacity-50`}
        >
          <Select.Value />
          <Select.Indicator>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Select.Indicator>
        </Select.Trigger>

        <Select.Popover className="min-w-(--trigger-width) max-h-64 overflow-auto rounded-lg border border-default-200 bg-background shadow-lg p-1">
          <ListBoxRoot items={options} className="outline-none">
            {(item: AppSelectOption) => (
              <ListBoxItemRoot
                key={item.id}
                id={item.id}
                textValue={item.label}
                className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none hover:bg-default-100 data-[selected]:bg-primary/10 data-[selected]:font-medium data-[focused]:bg-default-100"
              >
                {item.label}
              </ListBoxItemRoot>
            )}
          </ListBoxRoot>

          {/* Sentinel fuera del ListBox para que no interfiera con la selección */}
          {hasMore && (
            <div ref={setSentinel} data-testid="app-select-load-more" className="flex justify-center py-2">
              {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin opacity-60" />}
            </div>
          )}
        </Select.Popover>
      </Select.Root>
      {isInvalid && errorMessage && <span className="text-xs text-danger">{errorMessage}</span>}
    </div>
  );
}
