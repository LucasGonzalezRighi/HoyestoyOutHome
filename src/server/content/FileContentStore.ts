import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { VersionConflictError, type ContentStore, type StoredContent } from './ContentStore';

/** Lo que se escribe en el archivo. */
type FileContents = { data: unknown; version: number; updatedAt: string };

/**
 * El contenido en un archivo JSON local (`.data/content.json`, fuera de git).
 * Es el almacenamiento de desarrollo: el panel anda en la compu sin conectar
 * Neon. En Vercel no sirve (el disco es de solo lectura y no se comparte entre
 * instancias), por eso allá se usa Postgres.
 */
export class FileContentStore implements ContentStore {
  readonly kind = 'file';

  constructor(private readonly filePath: string) {}

  async read(): Promise<StoredContent | null> {
    let raw: string;
    try {
      raw = await readFile(this.filePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
    const contents = JSON.parse(raw) as FileContents;
    return { data: contents.data, version: contents.version, updatedAt: contents.updatedAt };
  }

  async write(data: unknown, expectedVersion: number): Promise<number> {
    const current = await this.read();
    if ((current?.version ?? 0) !== expectedVersion) throw new VersionConflictError();
    const contents: FileContents = {
      data,
      version: expectedVersion + 1,
      updatedAt: new Date().toISOString(),
    };
    await mkdir(path.dirname(this.filePath), { recursive: true });
    // Primero a un archivo temporal y después se renombra: si el proceso se
    // corta a mitad de la escritura, el archivo bueno no queda a medias.
    const temporary = `${this.filePath}.tmp`;
    await writeFile(temporary, JSON.stringify(contents, null, 2), 'utf8');
    await rename(temporary, this.filePath);
    return contents.version;
  }
}
