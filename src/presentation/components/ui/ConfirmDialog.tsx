'use client';

import type { UseOverlayStateReturn } from '@heroui/react';
import { AlertDialog, Button, useOverlayState } from '@heroui/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  state: UseOverlayStateReturn;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  state,
  title,
  description,
  confirmLabel = 'Eliminar',
  isLoading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Icon status="danger">
              <AlertTriangle className="h-5 w-5" />
            </AlertDialog.Icon>
            <AlertDialog.Header>
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-foreground/70">{description}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="ghost" onPress={state.close} isDisabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="danger" onPress={onConfirm} isDisabled={isLoading}>
                {isLoading ? 'Eliminando...' : confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog.Root>
  );
}

export { useOverlayState };
