import { PGlite } from '@electric-sql/pglite';

import type { SqlClient } from './SqlClient';

/**
 * Un Postgres de verdad, en memoria (PGlite, Postgres compilado a
 * WebAssembly), para probar las consultas sin una base remota. Cada llamada
 * es una base nueva y vacía.
 */
export async function createTestSqlClient(): Promise<SqlClient & { close(): Promise<void> }> {
  const db = new PGlite();
  await db.waitReady;
  return {
    query: async (text, params = []) =>
      (await db.query<Record<string, unknown>>(text, [...params])).rows,
    close: () => db.close(),
  };
}
