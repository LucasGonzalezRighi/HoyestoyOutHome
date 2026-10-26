import 'server-only';

import path from 'node:path';

import { neonSqlClient } from '@/server/db/neon';
import { serverEnv } from '@/server/env';

import type { ContentStore } from './ContentStore';
import { FileContentStore } from './FileContentStore';
import { PostgresContentStore } from './PostgresContentStore';
import { UnavailableContentStore } from './UnavailableContentStore';

/** El archivo del modo local: fuera de `src/` y de git (`.gitignore`). */
const LOCAL_CONTENT_FILE = path.join(process.cwd(), '.data', 'content.json');

let store: ContentStore | undefined;

/**
 * Dónde se guarda el contenido, según el entorno:
 *
 * 1. Con `DATABASE_URL`: Postgres (Neon). Es lo de producción, y sirve también
 *    en la compu para probar contra la base real.
 * 2. En Vercel sin `DATABASE_URL`: ninguno. El sitio muestra el respaldo y el
 *    panel avisa que falta conectar la base.
 * 3. En la compu sin `DATABASE_URL`: un archivo local (`.data/content.json`).
 */
export function getContentStore(): ContentStore {
  store ??= serverEnv.databaseUrl
    ? new PostgresContentStore(neonSqlClient(serverEnv.databaseUrl))
    : serverEnv.onVercel
      ? new UnavailableContentStore()
      : new FileContentStore(LOCAL_CONTENT_FILE);
  return store;
}
