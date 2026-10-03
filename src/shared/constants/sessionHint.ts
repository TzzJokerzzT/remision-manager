/**
 * Pista de sesión para el ruteo del servidor.
 *
 * NO es una credencial y no la lee ningún gate de autorización. Existe porque la
 * sesión real vive en `localStorage` (ver `auth.store` y `tokenStorage`), y el
 * servidor no puede consultarla: sin esta pista, la raíz `/` tendría que elegir
 * el destino a ciegas o resolverlo en el cliente (pagar JS solo para redirigir).
 *
 * El control real de acceso sigue en la API (validación del token) y en
 * `ProtectedShell`. Si esta cookie está rancia o falseada, el peor caso es un
 * salto a `/dashboard` que rebota a `/login` y se autocorrige.
 */
export const SESSION_HINT_COOKIE = 'remisiones_session';
export const SESSION_HINT_VALUE = '1';
export const SESSION_HINT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
