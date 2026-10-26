import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createTestSqlClient } from '@/server/db/pglite.fixture';
import { REVISIONS_TO_KEEP } from '@/server/db/schema';

import { VersionConflictError } from './ContentStore';
import { PostgresContentStore } from './PostgresContentStore';

describe('PostgresContentStore', () => {
  let client: Awaited<ReturnType<typeof createTestSqlClient>>;
  let store: PostgresContentStore;

  beforeEach(async () => {
    client = await createTestSqlClient();
    store = new PostgresContentStore(client);
  });

  afterEach(async () => {
    await client.close();
  });

  it('sin nada guardado devuelve null (y crea las tablas solo)', async () => {
    expect(await store.read()).toBeNull();
  });

  it('el primer guardado es la versión 1 y se lee tal cual', async () => {
    expect(await store.write({ hola: 'montaña' }, 0)).toBe(1);
    const stored = await store.read();
    expect(stored?.data).toEqual({ hola: 'montaña' });
    expect(stored?.version).toBe(1);
    expect(Number.isNaN(Date.parse(stored?.updatedAt ?? ''))).toBe(false);
  });

  it('cada guardado sube la versión y archiva la anterior', async () => {
    await store.write({ n: 1 }, 0);
    expect(await store.write({ n: 2 }, 1)).toBe(2);
    expect((await store.read())?.data).toEqual({ n: 2 });
    const revisions = await client.query(
      'SELECT version, data FROM site_content_revisions ORDER BY id',
    );
    expect(revisions).toEqual([{ version: 1, data: { n: 1 } }]);
  });

  it('no pisa lo que otra pestaña guardó: con una versión vieja tira y no cambia nada', async () => {
    await store.write({ n: 1 }, 0);
    await store.write({ n: 2 }, 1);
    await expect(store.write({ n: 'viejo' }, 1)).rejects.toBeInstanceOf(VersionConflictError);
    await expect(store.write({ n: 'otro primero' }, 0)).rejects.toBeInstanceOf(
      VersionConflictError,
    );
    expect(await store.read()).toMatchObject({ data: { n: 2 }, version: 2 });
  });

  it(`guarda solo las últimas ${REVISIONS_TO_KEEP} versiones anteriores`, async () => {
    for (let version = 0; version < REVISIONS_TO_KEEP + 5; version += 1) {
      await store.write({ version }, version);
    }
    const [row] = await client.query('SELECT count(*)::int AS total FROM site_content_revisions');
    expect(row?.total).toBe(REVISIONS_TO_KEEP);
  });
});
