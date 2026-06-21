'use client';

import { Modal, type UseOverlayStateReturn } from '@heroui/react';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface FormModalProps {
  state: UseOverlayStateReturn;
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormModal({ state, title, description, children }: FormModalProps) {
  return (
    <Modal.Root isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.Header>
              <div className="flex flex-1 flex-col gap-1">
                <Modal.Heading className="text-lg font-semibold">{title}</Modal.Heading>
                {description && <p className="text-sm text-foreground/60">{description}</p>}
              </div>
              <Modal.CloseTrigger className="rounded-md p-1.5 text-foreground/50 hover:bg-default-100 hover:text-foreground">
                <X className="h-4 w-4" />
              </Modal.CloseTrigger>
            </Modal.Header>
            <Modal.Body className="max-h-[70vh] overflow-y-auto">{children}</Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>
  );
}
