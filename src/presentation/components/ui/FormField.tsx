'use client';

import { Input, Label } from '@heroui/react';
import type { ComponentProps } from 'react';

interface FormFieldProps extends Omit<ComponentProps<typeof Input>, 'className'> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...rest }: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId} className="text-sm font-medium text-foreground/80">
        {label}
      </Label>
      <Input
        id={fieldId}
        fullWidth
        className={error ? 'border-danger focus-within:border-danger' : undefined}
        {...rest}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
