/**
 * Lo guardado tal como sale del almacenamiento, **sin validar**: `data` es lo
 * que hay en la base y recién `siteRecordSchema` dice si sirve.
 */
export type StoredContent = {
  /** El contenido, sin tipar. */
  readonly data: unknown;
  /** Número de versión: sube 1 con cada guardado. */
  readonly version: number;
  /** Cuándo se guardó por última vez (ISO 8601). */
  readonly updatedAt: string;
};

/** Dónde vive el contenido: Postgres (Neon), un archivo local o ninguno (solo lectura). */
export type ContentStoreKind = 'postgres' | 'file' | 'unavailable';

/**
 * Dónde se guarda el contenido editable. Un solo documento, con control de
 * versión optimista: `write` recibe la versión que se leyó y falla si
 * mientras tanto alguien guardó otra (dos pestañas del panel abiertas), en vez
 * de pisar esos cambios en silencio.
 */
export interface ContentStore {
  /** De qué tipo es: el panel lo muestra ("Base de datos" / "Modo local"). */
  readonly kind: ContentStoreKind;
  /** Lo guardado, o `null` si todavía no se guardó nada. */
  read(): Promise<StoredContent | null>;
  /**
   * Guarda `data` si la versión guardada sigue siendo `expectedVersion` (0 si
   * no había nada) y devuelve la versión nueva.
   *
   * @throws {VersionConflictError} Si otra pestaña guardó antes.
   * @throws {StoreUnavailableError} Si no hay dónde guardar.
   */
  write(data: unknown, expectedVersion: number): Promise<number>;
}

/** Alguien guardó otra versión entre que se leyó y se quiso guardar. */
export class VersionConflictError extends Error {
  constructor() {
    super('El contenido cambió desde que se abrió esta pantalla.');
    this.name = 'VersionConflictError';
  }
}

/** No hay almacenamiento configurado (por ejemplo, en Vercel sin `DATABASE_URL`). */
export class StoreUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoreUnavailableError';
  }
}
