import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { ADMIN_ROUTES } from '@/constants/routes';

import { readAdminConfig } from './adminConfig';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
} from './sessionToken';

/**
 * Abre la sesión del administrador: firma el token y lo deja en una cookie
 * `httpOnly` (el JavaScript de la página no la puede leer), `secure` fuera de
 * la compu, `sameSite: 'lax'` y solo para `/admin`.
 */
export async function createSession(email: string, secret: string): Promise<void> {
  const token = await signSessionToken(email, secret);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: ADMIN_ROUTES.home,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Cierra la sesión: borra la cookie. */
export async function deleteSession(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: ADMIN_ROUTES.home });
}

/**
 * El mail de la sesión activa, o `null`. Además de la firma, comprueba que el
 * mail siga siendo el de `ADMIN_EMAIL`: si se cambia la variable, las
 * sesiones viejas dejan de valer. Una vez por pedido (`cache`).
 */
export const readSession = cache(async (): Promise<string | null> => {
  const admin = readAdminConfig();
  if (!admin.ok) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const email = await verifySessionToken(token, admin.config.sessionSecret);
  return email === admin.config.email ? email : null;
});

/**
 * Corta el pedido y manda a la pantalla de entrada si no hay sesión. Va al
 * principio de **cada** página y acción del panel: el proxy es solo un primer
 * filtro, y una Server Action se puede llamar sin pasar por la página.
 */
export async function requireAdmin(): Promise<string> {
  const email = await readSession();
  if (!email) redirect(ADMIN_ROUTES.login);
  return email;
}
