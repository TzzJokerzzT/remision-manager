/**
 * Cliente de subida a Cloudinary (unsigned upload).
 *
 * Requiere dos variables de entorno públicas (deben empezar con NEXT_PUBLIC_
 * para estar disponibles en el navegador):
 *
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu_preset_unsigned
 *
 * Si en tu .env.local ya tienes estas variables con otro nombre, ajusta
 * las dos constantes de abajo en vez de renombrar tus variables.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export class CloudinaryUploadError extends Error {}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  bytes: number;
}

interface UploadOptions {
  /** Carpeta destino en Cloudinary. Solo funciona si el upload preset lo permite. */
  folder?: string;
  /** Callback de progreso (0-100). */
  onProgress?: (percent: number) => void;
  /** Permite cancelar la subida en curso. */
  signal?: AbortSignal;
}

/**
 * Sube un archivo a Cloudinary usando un upload preset "unsigned"
 * (subida directa desde el navegador, sin pasar por el backend).
 *
 * Usa el endpoint /auto/upload, que detecta automáticamente si el
 * archivo es imagen, video o "raw" (pdf, docs, etc.), así este mismo
 * helper sirve para más casos además de logos.
 */
export function uploadToCloudinary(file: File, options: UploadOptions = {}): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(
      new CloudinaryUploadError(
        'Faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en las variables de entorno'
      )
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    xhr.open('POST', endpoint);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: Record<string, unknown> | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new CloudinaryUploadError('Respuesta inválida de Cloudinary'));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && data) {
        resolve({
          secureUrl: data.secure_url as string,
          publicId: data.public_id as string,
          format: data.format as string | undefined,
          width: data.width as number | undefined,
          height: data.height as number | undefined,
          bytes: data.bytes as number,
        });
        return;
      }

      const message =
        (data?.error as { message?: string } | undefined)?.message ??
        'Error al subir el archivo a Cloudinary';
      reject(new CloudinaryUploadError(message));
    };

    xhr.onerror = () => reject(new CloudinaryUploadError('Error de red al subir el archivo'));
    xhr.onabort = () => reject(new CloudinaryUploadError('Subida cancelada'));

    options.signal?.addEventListener('abort', () => xhr.abort());

    xhr.send(formData);
  });
}
