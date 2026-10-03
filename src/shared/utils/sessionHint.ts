import {
  SESSION_HINT_COOKIE,
  SESSION_HINT_MAX_AGE_SECONDS,
  SESSION_HINT_VALUE,
} from '@/src/shared/constants/sessionHint';

/**
 * Marca la pista de sesión que lee la raíz `/` en el servidor.
 *
 * No es httpOnly a propósito: la escribe el cliente en el login. Tampoco lleva
 * `Secure` para no romper `http://localhost`; no es información sensible.
 */
export function setSessionHint(): void {
  if (typeof document === 'undefined') return;
  // biome-ignore lint/suspicious/noDocumentCookie: Firefox no implementa Cookie Store API, así que la escritura clásica es la vía portable y síncrona para una pista no autoritativa.
  document.cookie = `${SESSION_HINT_COOKIE}=${SESSION_HINT_VALUE}; path=/; max-age=${SESSION_HINT_MAX_AGE_SECONDS}; samesite=lax`;
}

/** Borra la pista; se llama al cerrar sesión y cuando el gate rebota a `/login`. */
export function clearSessionHint(): void {
  if (typeof document === 'undefined') return;
  // biome-ignore lint/suspicious/noDocumentCookie: mismo motivo que en setSessionHint.
  document.cookie = `${SESSION_HINT_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
