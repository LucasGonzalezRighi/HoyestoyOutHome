import { ensureSchema, REVISIONS_TO_KEEP } from '@/server/db/schema';
import type { SqlClient } from '@/server/db/SqlClient';

import { VersionConflictError, type ContentStore, type StoredContent } from './ContentStore';

/** El id de la única fila de `site_content`: todo el contenido es un documento. */
const CONTENT_ID = 'main';

/**
 * Actualiza el documento solo si sigue en la versión leída y, en la misma
 * sentencia, archiva la versión anterior. Al ser una sola sentencia es
 * atómica: o se guarda y se archiva, o no pasa nada.
 */
const UPDATE_SQL = `
  WITH previous AS (
    SELECT data, version FROM site_content WHERE id = $1 AND version = $3
  ), updated AS (
    UPDATE site_content
       SET data = $2::jsonb, version = version + 1, updated_at = now()
     WHERE id = $1 AND version = $3
    RETURNING version
  ), archived AS (
    INSERT INTO site_content_revisions (content_id, version, data)
    SELECT $1, previous.version, previous.data FROM previous
     WHERE EXISTS (SELECT 1 FROM updated)
  )
  SELECT version FROM updated`;

/** El primer guardado: si otra pestaña insertó antes, no devuelve filas. */
const INSERT_SQL = `
  INSERT INTO site_content (id, data, version) VALUES ($1, $2::jsonb, 1)
  ON CONFLICT (id) DO NOTHING
  RETURNING version`;

/** Deja solo las últimas versiones archivadas. */
const PRUNE_SQL = `
  DELETE FROM site_content_revisions
   WHERE content_id = $1
     AND id NOT IN (
       SELECT id FROM site_content_revisions
        WHERE content_id = $1 ORDER BY id DESC LIMIT $2
     )`;

/** El contenido en Postgres (Neon en producción). */
export class PostgresContentStore implements ContentStore {
  readonly kind = 'postgres';

  constructor(private readonly client: SqlClient) {}

  async read(): Promise<StoredContent | null> {
    await ensureSchema(this.client);
    const [row] = await this.client.query(
      'SELECT data, version, updated_at FROM site_content WHERE id = $1',
      [CONTENT_ID],
    );
    if (!row) return null;
    return {
      // why: según el driver, `jsonb` llega ya parseado o como texto.
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      version: Number(row.version),
      updatedAt: new Date(row.updated_at as string | Date).toISOString(),
    };
  }

  async write(data: unknown, expectedVersion: number): Promise<number> {
    await ensureSchema(this.client);
    const json = JSON.stringify(data);
    const rows =
      expectedVersion === 0
        ? await this.client.query(INSERT_SQL, [CONTENT_ID, json])
        : await this.client.query(UPDATE_SQL, [CONTENT_ID, json, expectedVersion]);
    const [row] = rows;
    if (!row) throw new VersionConflictError();
    await this.client.query(PRUNE_SQL, [CONTENT_ID, REVISIONS_TO_KEEP]);
    return Number(row.version);
  }
}
