import { StoreUnavailableError, type ContentStore, type StoredContent } from './ContentStore';

/**
 * Sin almacenamiento: en Vercel cuando todavía no se conectó Neon. El sitio se
 * muestra con el contenido de respaldo (`SEED_RECORD`) y el panel avisa que
 * falta conectar la base en vez de fallar al guardar sin explicación.
 */
export class UnavailableContentStore implements ContentStore {
  readonly kind = 'unavailable';

  async read(): Promise<StoredContent | null> {
    return null;
  }

  async write(): Promise<number> {
    throw new StoreUnavailableError(
      'Falta conectar la base de datos: en Vercel, Storage → Neon (crea la variable DATABASE_URL).',
    );
  }
}
