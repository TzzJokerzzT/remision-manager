'use client';

import { Button } from '@heroui/react';
import { Search, X } from 'lucide-react';
import type { ChangeEvent, KeyboardEvent } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, onSubmit, onClear, placeholder }: SearchInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  const hasValue = value.trim().length > 0;

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Buscar...'}
          className="w-full rounded-xl border border-default-300 bg-default-50 py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-default-600 dark:bg-default-900"
        />
        {hasValue && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button
        variant="primary"
        onPress={onSubmit}
        size="sm"
        className="bg-primary gap-1.5 transition-color duration-300 ease-in-out hover:bg-primary/70"
      >
        <Search className="h-3.5 w-3.5" />
        Buscar
      </Button>
    </div>
  );
}
