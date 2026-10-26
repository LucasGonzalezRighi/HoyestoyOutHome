import 'server-only';

import { serverEnv } from '@/server/env';

import { HASH_SCHEME } from './password';
import { MIN_SECRET_LENGTH } from './sessionToken';

/** La configuración de la entrada al panel, completa. */
export type AdminConfig = {
  /** El único mail que puede entrar (se compara sin mayúsculas). */
  readonly email: string;
  /** Hash scrypt de la contraseña (`npm run admin:credentials`). */
  readonly passwordHash: string;
  /** Secreto con el que se firman las sesiones. */
  readonly sessionSecret: string;
};

/** La configuración, o qué variables faltan. */
export type AdminConfigResult =
  | { readonly ok: true; readonly config: AdminConfig }
  | { readonly ok: false; readonly missing: readonly string[] };

/**
 * Lee la configuración del panel de las variables de entorno. Si falta algo,
 * el panel no deja entrar a nadie y la pantalla de entrada dice qué falta (sin
 * mostrar ningún valor).
 */
export function readAdminConfig(): AdminConfigResult {
  const { adminEmail, adminPasswordHash, adminSessionSecret } = serverEnv;
  const missing = [
    adminEmail ? undefined : 'ADMIN_EMAIL',
    adminPasswordHash?.startsWith(`${HASH_SCHEME}:`) ? undefined : 'ADMIN_PASSWORD_HASH',
    adminSessionSecret && adminSessionSecret.length >= MIN_SECRET_LENGTH
      ? undefined
      : 'ADMIN_SESSION_SECRET',
  ].filter((name): name is string => name !== undefined);

  if (missing.length > 0 || !adminEmail || !adminPasswordHash || !adminSessionSecret) {
    return { ok: false, missing };
  }
  return {
    ok: true,
    config: {
      email: adminEmail.toLowerCase(),
      passwordHash: adminPasswordHash,
      sessionSecret: adminSessionSecret,
    },
  };
}
