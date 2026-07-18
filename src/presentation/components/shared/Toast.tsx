'use client';

import type { ToastContentValue } from '@heroui/react';
import { Toast, ToastContent, ToastDescription, ToastIndicator, ToastQueue, ToastTitle } from '@heroui/react';

/** Shared queue — toasts can be triggered from anywhere without prop drilling. */
export const toastQueue = new ToastQueue({ maxVisibleToasts: 4 });

type ToastVariant = 'success' | 'danger' | 'warning' | 'accent' | 'default';

const borderClass: Record<ToastVariant, string> = {
  success: 'border-success',
  danger: 'border-danger',
  warning: 'border-warning',
  accent: 'border-accent',
  default: 'border-border',
};

const backgroundClass: Record<ToastVariant, string> = {
  success: 'bg-success/10',
  danger: 'bg-danger/10',
  warning: 'bg-warning/10',
  accent: 'bg-accent/10',
  default: 'bg-surface',
};

const textClass: Record<ToastVariant, string> = {
  success: 'text-success-soft-foreground',
  danger: 'text-danger-soft-foreground',
  warning: 'text-warning-soft-foreground',
  accent: 'text-accent-soft-foreground',
  default: 'text-foreground',
};

/**
 * Custom toast render function for {@link Toast.Provider}.
 *
 * Uses semantic variant tokens so success/danger/warning each get
 * color-coded borders, backgrounds, and indicators automatically.
 */
export function CustomToast({ toast: toastItem }: { toast: any }) {
  const content = toastItem.content as ToastContentValue;
  const variant = (content.variant as ToastVariant) ?? 'default';

  return (
    <Toast
      className={`rounded-xl border ${borderClass[variant]} ${backgroundClass[variant]}`}
      toast={toastItem}
      variant={content.variant}
    >
      <ToastContent>
        <div className="flex items-center gap-2">
          <ToastIndicator className={textClass[variant]} variant={content.variant} />
          <div className="flex flex-col pr-6">
            {content.title && <ToastTitle className={textClass[variant]}>{content.title}</ToastTitle>}
            {content.description && <ToastDescription>{content.description}</ToastDescription>}
          </div>
        </div>
      </ToastContent>
      <Toast.CloseButton className="absolute top-1/2 right-2 -translate-y-1/2 border-none bg-transparent opacity-100 [&>svg]:size-4" />
    </Toast>
  );
}

/** Options passed to {@link showToast}. */
export interface ShowToastOptions {
  /** Title displayed above the description. Defaults vary by status. */
  title?: string;
  /** How long the toast stays visible (ms). 0 = persistent. */
  timeout?: number;
}

/**
 * Trigger a toast notification with success or error styling.
 *
 * @example
 * showToast('Documento guardado', 'success');
 * showToast('No se pudo conectar al servidor', 'error');
 * showToast('Cambios guardados', 'success', { title: 'Listo', timeout: 3000 });
 */
export function showToast(
  message: string,
  status: 'success' | 'error' = 'success',
  options?: ShowToastOptions
): string {
  const isSuccess = status === 'success';
  return toastQueue.add({
    title: options?.title ?? (isSuccess ? 'Éxito' : 'Error'),
    description: message,
    variant: isSuccess ? 'success' : 'danger',
  });
}
