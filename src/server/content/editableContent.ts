import 'server-only';

import { updateTag } from 'next/cache';

import { todayInBusinessTimeZone } from '@/content/catalog/departures';
import { siteRecordSchema, type SiteRecord } from '@/content/records/schema';
import { validateSiteRecord, type ValidationIssue } from '@/content/records/validate';
import { SEED_RECORD } from '@/content/seed';

import { StoreUnavailableError, VersionConflictError, type ContentStoreKind } from './ContentStore';
import { CONTENT_CACHE_TAG } from './siteContent';
import { getContentStore } from './store';

/** Lo que ve el panel: el contenido vigente (sin caché) y de dónde sale. */
export type EditableContent = {
  readonly record: SiteRecord;
  /** Versión guardada; 0 si todavía no se guardó nada (se ve el contenido inicial). */
  readonly version: number;
  /** Último guardado (ISO 8601), o `null`. */
  readonly updatedAt: string | null;
  /** Dónde se guarda. */
  readonly storeKind: ContentStoreKind;
  /** Aviso si lo guardado no se pudo leer y se muestra el contenido inicial. */
  readonly problem?: string;
};

/**
 * El contenido vigente para editar, leído directo del almacenamiento (sin la
 * caché del sitio): lo que se ve en el panel es siempre lo último guardado.
 */
export async function readEditableContent(): Promise<EditableContent> {
  const store = getContentStore();
  const stored = await store.read();
  if (!stored) {
    return { record: SEED_RECORD, version: 0, updatedAt: null, storeKind: store.kind };
  }
  const parsed = siteRecordSchema.safeParse(stored.data);
  if (!parsed.success) {
    console.error('[panel] Lo guardado no pasa la validación.', parsed.error);
    return {
      record: SEED_RECORD,
      version: stored.version,
      updatedAt: stored.updatedAt,
      storeKind: store.kind,
      problem:
        'Lo guardado no se pudo leer y se muestra el contenido inicial. Al guardar, se reemplaza.',
    };
  }
  return {
    record: parsed.data,
    version: stored.version,
    updatedAt: stored.updatedAt,
    storeKind: store.kind,
  };
}

/** Resultado de guardar desde el panel. */
export type SaveResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string; readonly issues: readonly ValidationIssue[] };

/** Cuántas veces se reintenta si otra pestaña guardó justo en el medio. */
const CONFLICT_RETRIES = 2;

/**
 * Aplica un cambio sobre el contenido vigente, lo valida entero y lo guarda.
 * Después invalida la caché del sitio: el cambio se ve en la próxima visita.
 *
 * Cada pantalla del panel cambia solo su parte (un viaje, las preguntas…) y
 * el cambio se aplica sobre lo último guardado: dos pestañas que editan cosas
 * distintas no se pisan. Si otra pestaña guarda justo entre la lectura y la
 * escritura, se vuelve a leer y a aplicar el cambio.
 *
 * Solo se llama desde Server Actions (`updateTag` no anda en otro lado), y la
 * acción ya verificó la sesión.
 *
 * @param change Recibe el contenido vigente y devuelve el nuevo (sin validar).
 */
export async function saveEditableContent(
  change: (record: SiteRecord) => unknown,
): Promise<SaveResult> {
  const store = getContentStore();
  for (let attempt = 0; attempt <= CONFLICT_RETRIES; attempt += 1) {
    const current = await readEditableContent();
    const result = validateSiteRecord(change(current.record), todayInBusinessTimeZone());
    if (!result.ok) {
      return { ok: false, message: 'Hay datos para corregir.', issues: result.issues };
    }
    try {
      await store.write(result.record, current.version);
      updateTag(CONTENT_CACHE_TAG);
      return { ok: true };
    } catch (error) {
      if (error instanceof VersionConflictError) continue;
      if (error instanceof StoreUnavailableError) {
        return { ok: false, message: error.message, issues: [] };
      }
      console.error('[panel] No se pudo guardar.', error);
      return {
        ok: false,
        message: 'No se pudo guardar. Probá de nuevo en un rato.',
        issues: [],
      };
    }
  }
  return {
    ok: false,
    message: 'Otra pestaña está guardando cambios al mismo tiempo. Probá de nuevo.',
    issues: [],
  };
}
