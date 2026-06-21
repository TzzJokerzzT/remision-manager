import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
