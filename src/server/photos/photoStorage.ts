import 'server-only';

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { put } from '@vercel/blob';

import { serverEnv } from '@/server/env';

/** Dónde quedan las fotos que se suben desde el panel. */
export type PhotoStorageKind = 'blob' | 'local' | 'unavailable';

/**
 * Guarda una foto ya validada y devuelve su `src` público (lo que va en
 * `PhotoRecord.src` y lee `next/image`).
 */
export interface PhotoStorage {
  readonly kind: PhotoStorageKind;
  save(fileName: string, bytes: Uint8Array, contentType: string): Promise<string>;
}

/** Carpeta de Vercel Blob donde van las fotos del panel. */
const BLOB_FOLDER = 'fotos';

/** Un año: el nombre de cada archivo es único (un UUID), así que nunca cambia su contenido. */
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/** Vercel Blob (producción). Lee `BLOB_READ_WRITE_TOKEN` sola. */
class BlobPhotoStorage implements PhotoStorage {
  readonly kind = 'blob';

  async save(fileName: string, bytes: Uint8Array, contentType: string): Promise<string> {
    const blob = await put(`${BLOB_FOLDER}/${fileName}`, Buffer.from(bytes), {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: ONE_YEAR_SECONDS,
    });
    return blob.url;
  }
}

/** Carpeta pública de las fotos en modo local (fuera de git). */
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * `public/uploads/` (desarrollo): `next dev` sirve los archivos nuevos de
 * `public/` sin reiniciar. En Vercel no sirve (el disco es de solo lectura).
 */
class LocalPhotoStorage implements PhotoStorage {
  readonly kind = 'local';

  async save(fileName: string, bytes: Uint8Array): Promise<string> {
    await mkdir(LOCAL_UPLOADS_DIR, { recursive: true });
    await writeFile(path.join(LOCAL_UPLOADS_DIR, fileName), bytes);
    return `/uploads/${fileName}`;
  }
}

/** En Vercel sin Blob conectado: avisa qué falta en vez de fallar sin explicación. */
class UnavailablePhotoStorage implements PhotoStorage {
  readonly kind = 'unavailable';

  async save(): Promise<string> {
    throw new Error(
      'Falta conectar el almacenamiento de fotos: en Vercel, Storage → Blob (crea la variable BLOB_READ_WRITE_TOKEN).',
    );
  }
}

let storage: PhotoStorage | undefined;

/** Blob si hay token; si no, la carpeta local en la compu, o ninguno en Vercel. */
export function getPhotoStorage(): PhotoStorage {
  storage ??= serverEnv.blobToken
    ? new BlobPhotoStorage()
    : serverEnv.onVercel
      ? new UnavailablePhotoStorage()
      : new LocalPhotoStorage();
  return storage;
}
