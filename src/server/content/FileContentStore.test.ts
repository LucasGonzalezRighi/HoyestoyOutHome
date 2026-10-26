import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { VersionConflictError } from './ContentStore';
import { FileContentStore } from './FileContentStore';

describe('FileContentStore', () => {
  let directory: string;
  let store: FileContentStore;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'hoy-estoy-content-'));
    store = new FileContentStore(path.join(directory, 'sub', 'content.json'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('sin archivo devuelve null', async () => {
    expect(await store.read()).toBeNull();
  });

  it('crea la carpeta, guarda y sube la versión', async () => {
    expect(await store.write({ n: 1 }, 0)).toBe(1);
    expect(await store.write({ n: 2 }, 1)).toBe(2);
    expect(await store.read()).toMatchObject({ data: { n: 2 }, version: 2 });
  });

  it('no pisa lo guardado con una versión vieja', async () => {
    await store.write({ n: 1 }, 0);
    await expect(store.write({ n: 'viejo' }, 0)).rejects.toBeInstanceOf(VersionConflictError);
    expect(await store.read()).toMatchObject({ data: { n: 1 }, version: 1 });
  });
});
