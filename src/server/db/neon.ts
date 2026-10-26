import 'server-only';

import { neon } from '@neondatabase/serverless';

import type { SqlClient } from './SqlClient';

/**
 * Conexión a Neon (el Postgres de Vercel → Storage) por HTTP: cada consulta
 * es un pedido, sin un pool que mantener abierto. Es lo que conviene en
 * funciones serverless que se prenden y se apagan.
 */
export function neonSqlClient(connectionString: string): SqlClient {
  const sql = neon(connectionString);
  return {
    query: (text, params = []) =>
      sql.query(text, [...params]) as Promise<Record<string, unknown>[]>,
  };
}
