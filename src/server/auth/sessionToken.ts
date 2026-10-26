import { jwtVerify, SignJWT } from 'jose';

/**
 * El token de la sesión del panel: un JWT firmado con HMAC (HS256) con el
 * secreto `ADMIN_SESSION_SECRET`. Lo firma el login y lo verifican el proxy
 * (`src/proxy.ts`, antes de entrar a `/admin`) y cada página y acción del
 * panel (`requireAdmin`).
 *
 * No usa `next/headers` ni `server-only`: el proxy también lo importa.
 */

/** Nombre de la cookie de sesión. */
export const SESSION_COOKIE = 'hoy_admin_session';

/** Cuánto dura una sesión: 7 días, en segundos. */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** Quién firma el token: si el secreto se reutilizara en otro sistema, sus tokens no sirven acá. */
const ISSUER = 'hoy-estoy-ooh-admin';

/** Largo mínimo del secreto: 32 caracteres aleatorios dan 192 bits o más. */
export const MIN_SECRET_LENGTH = 32;

/** El secreto como clave HMAC. */
function keyOf(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/** Firma un token de sesión para el mail del administrador. */
export async function signSessionToken(email: string, secret: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(email)
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(keyOf(secret));
}

/**
 * Verifica un token de sesión (firma, emisor, vencimiento y algoritmo) y
 * devuelve el mail, o `null` si no sirve. Nunca tira.
 */
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, keyOf(secret), {
      algorithms: ['HS256'],
      issuer: ISSUER,
    });
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}
