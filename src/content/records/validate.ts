import { toTrip } from '@/content/catalog/trips';
import { buildSiteContent } from '@/content/index';
import { buildTripDetail } from '@/content/trips/build';

import { siteRecordSchema, type SiteRecord } from './schema';

/** Un problema del contenido: dónde (`trips.0.itinerary.2.title`) y qué. */
export type ValidationIssue = {
  /** Ruta del dato, con puntos. Vacía si el problema es del contenido entero. */
  readonly path: string;
  /** Qué está mal, en castellano, para mostrar en el panel. */
  readonly message: string;
};

/** El contenido validado, o la lista de problemas. */
export type ValidationResult =
  | { readonly ok: true; readonly record: SiteRecord }
  | { readonly ok: false; readonly issues: readonly ValidationIssue[] };

/** El mensaje de un error del dominio (las invariantes tiran `Error` con texto en castellano). */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Valida el contenido antes de guardarlo, en dos pasos:
 *
 * 1. La forma (`siteRecordSchema`): campos, tipos, largos, slugs únicos.
 * 2. Las invariantes del dominio: arma el sitio entero con `buildSiteContent`
 *    y la página de **cada** viaje, también de los ocultos (si no, un viaje
 *    roto explotaría recién el día que se lo vuelve a mostrar).
 *
 * Si pasa, lo guardado siempre se puede mostrar: el sitio nunca se rompe por
 * algo que se cargó en el panel.
 *
 * @param today `AAAA-MM-DD`: el mismo "hoy" con el que se arma el sitio.
 */
export function validateSiteRecord(candidate: unknown, today: string): ValidationResult {
  const parsed = siteRecordSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.'),
        message: issue.message,
      })),
    };
  }

  const record = parsed.data;
  const issues: ValidationIssue[] = [];
  record.trips.forEach((trip, index) => {
    try {
      buildTripDetail(toTrip(trip), trip, []);
    } catch (error) {
      issues.push({ path: `trips.${index}`, message: messageOf(error) });
    }
  });
  if (issues.length === 0) {
    try {
      buildSiteContent(record, today);
    } catch (error) {
      issues.push({ path: '', message: messageOf(error) });
    }
  }

  return issues.length === 0 ? { ok: true, record } : { ok: false, issues };
}
