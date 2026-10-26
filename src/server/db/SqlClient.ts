/**
 * Lo mínimo que el código necesita de una conexión a Postgres: una consulta
 * con parámetros (`$1`, `$2`…) que devuelve las filas.
 *
 * Existe para no atar el código al driver: en producción es Neon
 * (`neonSqlClient`), en los tests es PGlite (Postgres en memoria, en
 * WebAssembly). Así las consultas de verdad se prueban sin una base remota.
 */
export type SqlClient = {
  query(text: string, params?: readonly unknown[]): Promise<Record<string, unknown>[]>;
};
