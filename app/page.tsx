import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_HINT_COOKIE, SESSION_HINT_VALUE } from '@/src/shared/constants/sessionHint';

/**
 * Raíz de la aplicación: solo decide el destino.
 *
 * Antes era un client component entero (zustand + spinner + useEffect +
 * router.replace) que costaba ~223 KiB gz de JS únicamente para redirigir. La
 * decisión no necesita el token: alcanza con la pista de sesión no autoritativa,
 * porque el acceso real lo siguen controlando la API y `ProtectedShell`.
 */
export default async function RootPage() {
  const store = await cookies();
  const hasSessionHint = store.get(SESSION_HINT_COOKIE)?.value === SESSION_HINT_VALUE;

  redirect(hasSessionHint ? '/dashboard' : '/login');
}
