'use client';

import { Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { type ChangeEvent, type DragEvent, useId, useRef, useState } from 'react';
import { type CloudinaryUploadResult, uploadToCloudinary } from '@/src/shared/utils/cloudinary';
import type { DropzoneProps } from '../utils/types';

export function Dropzone({
  value,
  onChange,
  label,
  helperText,
  error,
  accept = 'image/png,image/jpeg,image/webp',
  maxSizeMB = 5,
  folder,
  disabled,
}: DropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl || value || null;
  const errorMessage = error ?? localError;
  const acceptedTypes = accept.split(',').map((type) => type.trim());

  const validateFile = (file: File): string | null => {
    const matchesType = acceptedTypes.some((type) =>
      type.endsWith('/*') ? file.type.startsWith(type.replace('/*', '/')) : file.type === type
    );
    if (!matchesType) {
      return `Formato no permitido. Usa: ${accept.replaceAll(',', ', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `El archivo supera el tamaño máximo de ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);
    setProgress(0);

    try {
      const result: CloudinaryUploadResult = await uploadToCloudinary(file, {
        folder,
        onProgress: setProgress,
      });
      onChange(result.secureUrl);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'No se pudo subir el archivo');
      setPreviewUrl(null);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading) inputRef.current?.click();
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = '';
  };

  const onDrop = (event: DragEvent<HTMLFieldSetElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onRemove = () => {
    setPreviewUrl(null);
    setLocalError(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {/* Zona de arrastre: un contenedor sin rol interactivo. El disparador real es un
          <button>, porque un botón no puede contener el <input type="file"> ni el botón de
          quitar (contenido interactivo anidado). */}
      <fieldset
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={[
          'relative m-0 flex min-h-36 min-w-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed p-4 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-default-200 bg-default-50',
          errorMessage ? 'border-danger/60' : '',
          disabled ? 'opacity-60' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onInputChange}
          disabled={disabled || isUploading}
        />

        {displayUrl ? (
          <div className="relative">
            <button
              type="button"
              onClick={openFileDialog}
              disabled={disabled || isUploading}
              aria-label="Cambiar imagen"
              className="cursor-pointer rounded-xl disabled:cursor-not-allowed"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- preview de blob: y de Cloudinary, no requiere optimización de next/image */}
              <Image
                width={200}
                height={200}
                src={displayUrl}
                alt="Vista previa"
                className="h-24 w-24 rounded-xl object-cover"
              />
            </button>

            {!isUploading && (
              <button
                type="button"
                onClick={onRemove}
                className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white shadow"
                aria-label="Quitar imagen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={openFileDialog}
            disabled={disabled || isUploading}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            <UploadCloud className="h-7 w-7 text-foreground/40" />
            <span className="text-sm text-foreground/70">
              Arrastra una imagen aquí o{' '}
              <span className="font-medium text-primary">haz clic para elegir</span>
            </span>
          </button>
        )}

        {isUploading && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        )}
      </fieldset>

      {helperText && !errorMessage && <p className="text-xs text-foreground/50">{helperText}</p>}
      {errorMessage && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{errorMessage}</p>
      )}
    </div>
  );
}
