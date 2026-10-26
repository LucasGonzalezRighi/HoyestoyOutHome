'use server';

import { timingSafeEqual } from 'node:crypto';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_ROUTES } from '@/constants/routes';
import { readAdminConfig } from '@/server/auth/adminConfig';
import { verifyPassword } from '@/server/auth/password';
import { createSession, deleteSession } from '@/server/auth/session';
import { getLoginThrottle } from '@/server/auth/throttle';

/** Lo que vuelve a la pantalla de entrada. */
export type LoginState = {
  /** El error a mostrar, si lo hubo. */
  readonly error?: string;
  /** El mail que se escribió, para no hacerlo escribir de nuevo. */
  readonly email?: string;
};

/** Compara dos textos en tiempo constante (no deja adivinar el mail por cuánto tarda). */
function sameText(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** La IP de quien intenta entrar (en Vercel la pone el proxy de Vercel). */
async function clientKey(): Promise<string> {
  const forwarded = (await headers()).get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'local';
}

/**
 * A dónde volver después de entrar: solo rutas del panel (si no, el link de
 * entrada se podría usar para mandar a alguien a otro sitio).
 */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith(`${ADMIN_ROUTES.home}/`) && !next.startsWith('//')
    ? next
    : ADMIN_ROUTES.home;
}

/**
 * Entrada al panel. Verifica el freno de intentos, el mail y la contraseña
 * (siempre las dos cosas, para tardar lo mismo aunque el mail esté mal) y
 * abre la sesión. El error no dice cuál de los dos falló.
 */
export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  const admin = readAdminConfig();
  if (!admin.ok) {
    return { error: 'El panel todavía no está configurado en este servidor.', email };
  }

  const throttle = getLoginThrottle();
  const key = await clientKey();
  if (await throttle.isBlocked(key)) {
    return { error: 'Demasiados intentos. Esperá 15 minutos y probá de nuevo.', email };
  }

  const passwordOk = await verifyPassword(password, admin.config.passwordHash);
  if (!(passwordOk && sameText(email, admin.config.email))) {
    await throttle.recordFailure(key);
    return { error: 'El mail o la contraseña no coinciden.', email };
  }

  await throttle.reset(key);
  await createSession(admin.config.email, admin.config.sessionSecret);
  redirect(safeNext(formData.get('next')));
}

/** Salir del panel. */
export async function logout(): Promise<void> {
  await deleteSession();
  redirect(ADMIN_ROUTES.login);
}
