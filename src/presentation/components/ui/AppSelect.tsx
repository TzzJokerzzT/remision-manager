'use client';

import { ListBoxItemRoot, ListBoxRoot, Select } from '@heroui/react';
import { ChevronDown } from 'lucide-react';

export interface AppSelectOption {
  id: string;
  label: string;
}

interface AppSelectProps {
  label?: string;
  placeholder?: string;
  options: AppSelectOption[];
  selectedKey: string | null;
  onSelectionChange: (key: string | null) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

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
}: AppSelectProps) {
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
        <Select.Popover className="min-w-(--trigger-width) rounded-lg border border-default-200 bg-background shadow-lg p-1">
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
        </Select.Popover>
      </Select.Root>
      {isInvalid && errorMessage && <span className="text-xs text-danger">{errorMessage}</span>}
    </div>
  );
}
