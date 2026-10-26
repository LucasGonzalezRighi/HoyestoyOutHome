import type { SqlClient } from './SqlClient';

/**
 * Las tablas del panel. Se crean solas la primera vez que se usa la base
 * (`ensureSchema`): no hace falta correr migraciones a mano al conectar Neon.
 *
 * - `site_content`: el contenido editable, un documento JSON validado
 *   (`siteRecordSchema`) con un número de versión para no pisar cambios.
 * - `site_content_revisions`: cada versión anterior al guardar, por si hay
 *   que volver atrás (se guardan las últimas `REVISIONS_TO_KEEP`).
 * - `admin_login_failures`: los intentos de entrada fallidos, para frenar a
 *   quien prueba contraseñas (`LoginThrottle`).
 *
 * Una sentencia por consulta: el driver HTTP de Neon no acepta varias juntas.
 */
const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS site_content (
     id text PRIMARY KEY,
     data jsonb NOT NULL,
     version integer NOT NULL,
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS site_content_revisions (
     id bigserial PRIMARY KEY,
     content_id text NOT NULL,
     version integer NOT NULL,
     data jsonb NOT NULL,
     saved_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS admin_login_failures (
     key text NOT NULL,
     failed_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS admin_login_failures_key_idx
     ON admin_login_failures (key, failed_at)`,
] as const;

/** Cuántas versiones anteriores del contenido se guardan. */
export const REVISIONS_TO_KEEP = 50;

/** Una creación por cliente y por proceso: después es una promesa ya resuelta. */
const ready = new WeakMap<SqlClient, Promise<void>>();

/**
 * Crea las tablas si no existen. Es idempotente y se llama antes de cada uso;
 * solo la primera vez por proceso consulta a la base.
 */
export function ensureSchema(client: SqlClient): Promise<void> {
  let promise = ready.get(client);
  if (!promise) {
    promise = (async () => {
      for (const statement of SCHEMA_STATEMENTS) await client.query(statement);
    })();
    // why: si falla (la base no responde), el próximo intento tiene que
    // volver a probar en vez de quedarse con la promesa rechazada.
    promise.catch(() => ready.delete(client));
    ready.set(client, promise);
  }
  return promise;
}
