'use client';

import { usePDFSlick } from '@pdfslick/react';
import '@pdfslick/react/dist/pdf_viewer.css';
import { Button } from '@heroui/react';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Spinner } from '@/src/presentation/components/shared/Spinner';

interface RemisionPdfViewerProps {
  pdfBytes: ArrayBuffer;
  filename: string;
}

export function RemisionPdfViewer({ pdfBytes, filename }: RemisionPdfViewerProps) {
  const { viewerRef, usePDFSlickStore, PDFSlickViewer, isDocumentLoaded } = usePDFSlick(pdfBytes, {
    scaleValue: 'page-fit',
    filename,
  });

  const pageNumber = usePDFSlickStore((s) => s.pageNumber);
  const numPages = usePDFSlickStore((s) => s.numPages);
  const pdfSlick = usePDFSlickStore((s) => s.pdfSlick);

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-default-200 bg-default-100 dark:bg-default-50/5">
      <div className="flex items-center justify-between gap-2 border-b border-default-200 bg-background px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            aria-label="Página anterior"
            isDisabled={!isDocumentLoaded || pageNumber <= 1}
            onPress={() => pdfSlick?.gotoPage(pageNumber - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-20 text-center text-xs text-foreground/60">
            {isDocumentLoaded ? `${pageNumber} / ${numPages}` : '—'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            aria-label="Página siguiente"
            isDisabled={!isDocumentLoaded || pageNumber >= numPages}
            onPress={() => pdfSlick?.gotoPage(pageNumber + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            aria-label="Alejar"
            isDisabled={!isDocumentLoaded}
            onPress={() => pdfSlick?.decreaseScale()}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            aria-label="Acercar"
            isDisabled={!isDocumentLoaded}
            onPress={() => pdfSlick?.increaseScale()}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            isDisabled={!isDocumentLoaded}
            onPress={() => pdfSlick?.downloadOrSave()}
          >
            <Download className="h-3.5 w-3.5" /> Descargar
          </Button>
        </div>
      </div>

      <div className="relative flex-1">
        {!isDocumentLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-default-100 dark:bg-default-50/5">
            <Spinner />
          </div>
        )}
        <div className="pdfSlick absolute inset-0">
          <PDFSlickViewer {...{ viewerRef, usePDFSlickStore }} />
        </div>
      </div>
    </div>
  );
}
