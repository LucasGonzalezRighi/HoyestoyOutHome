import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/**
 * Hash de contraseñas con scrypt (incluido en Node, sin dependencias).
 *
 * La contraseña del panel nunca se guarda ni se sube al repo: en la variable
 * `ADMIN_PASSWORD_HASH` va solo este hash, que se genera con
 * `npm run admin:credentials` (`scripts/admin-credentials.mjs`, mismo formato).
 *
 * Formato: `scrypt:<N>:<r>:<p>:<sal>:<hash>` (sal y hash en base64url). Los
 * parámetros van adentro del texto para poder subirlos más adelante sin
 * invalidar los hashes viejos. Separado con `:` y no con `$` porque Next
 * expande `$NOMBRE` al leer `.env.local`, y el hash quedaría mutilado.
 */

/** Primer tramo del hash: con qué algoritmo se generó. */
export const HASH_SCHEME = 'scrypt';

/** Costo por defecto: N = 2^15 (unos 32 MB y ~100 ms por intento). */
const DEFAULT_COST = { N: 2 ** 15, r: 8, p: 1 } as const;

/** Largo del hash derivado, en bytes. */
const KEY_LENGTH = 64;

/** Memoria máxima que se le permite a scrypt (Node trae 32 MB, justo el límite para N = 2^15). */
const MAX_MEMORY = 128 * 1024 * 1024;

/** scrypt con promesa (la versión de `node:crypto` es con callback). */
function deriveKey(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { ...options, maxmem: MAX_MEMORY }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/** Genera el hash de una contraseña, con sal aleatoria. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, DEFAULT_COST);
  const { N, r, p } = DEFAULT_COST;
  return [HASH_SCHEME, N, r, p, salt.toString('base64url'), key.toString('base64url')].join(':');
}

/**
 * Compara una contraseña con un hash guardado, en tiempo constante. Devuelve
 * `false` (no tira) si el hash no tiene el formato esperado.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split(':');
  if (scheme !== HASH_SCHEME || !n || !r || !p || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  if (expected.length !== KEY_LENGTH) return false;
  const key = await deriveKey(password, Buffer.from(salt, 'base64url'), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return timingSafeEqual(key, expected);
}
