import { useEffect, useState } from 'react';
import type { Client } from '@/src/core/domain/entities/Client';
import type { Company } from '@/src/core/domain/entities/Company';
import type { Driver } from '@/src/core/domain/entities/Driver';
import type { Remision } from '@/src/core/domain/entities/Remision';
import { generateRemisionPdf } from './generateRemisionPdf';

interface UseRemisionPdfParams {
  remision: Remision | undefined;
  company: Company | undefined;
  client: Client | undefined;
  driver: Driver | undefined;
}

export function useRemisionPdf({ remision, company, client, driver }: UseRemisionPdfParams) {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isReady = !!remision && !!company && !!client;

  useEffect(() => {
    if (!remision || !company || !client) {
      setPdfBytes(null);
      return;
    }

    let cancelled = false;
    setIsGenerating(true);
    setError(null);

    generateRemisionPdf({ remision, company, client, driver })
      .then((bytes) => {
        if (cancelled) return;
        // Copiamos a un ArrayBuffer "limpio": Uint8Array.buffer puede ser más grande
        // que la vista si pdf-lib reusó un buffer compartido.
        const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        setPdfBytes(buffer as ArrayBuffer);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('No se pudo generar el PDF'));
      })
      .finally(() => {
        if (!cancelled) setIsGenerating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [remision, company, client, driver]);

  return { pdfBytes, isGenerating, isReady, error };
}
