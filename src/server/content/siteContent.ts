import 'server-only';

import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { todayInBusinessTimeZone } from '@/content/catalog/departures';
import { buildSiteContent, type SiteContent } from '@/content/index';
import {
  SITE_RECORD_SCHEMA_VERSION,
  siteRecordSchema,
  type SiteRecord,
} from '@/content/records/schema';
import { SEED_RECORD } from '@/content/seed';

import { getContentStore } from './store';

/**
 * Etiqueta de caché del contenido: todo lo que se arma con lo guardado queda
 * cacheado bajo esta etiqueta, y el panel la invalida al guardar
 * (`updateTag(CONTENT_CACHE_TAG)`).
 */
export const CONTENT_CACHE_TAG = 'site-content';

/**
 * Lee lo guardado y lo valida. Sin nada guardado, el contenido inicial.
 *
 * Tira si la base no responde o si lo guardado no pasa la validación: así
 * `unstable_cache` **no** guarda ese resultado y el próximo pedido vuelve a
 * probar (si devolviera el respaldo, quedaría cacheado hasta el próximo
 * guardado del panel).
 */
async function readPublishedRecord(): Promise<SiteRecord> {
  const stored = await getContentStore().read();
  if (!stored) return SEED_RECORD;
  const parsed = siteRecordSchema.safeParse(stored.data);
  if (!parsed.success) {
    throw new Error(
      `El contenido guardado (versión ${stored.version}) no pasa la validación: ${parsed.error.message}`,
    );
  }
  return parsed.data;
}

/**
 * Huella del contenido inicial (FNV-1a de 32 bits sobre su JSON): cambia cada
 * vez que se edita `SEED_RECORD` en el código.
 */
function seedFingerprint(): string {
  let hash = 0x811c9dc5;
  for (const char of JSON.stringify(SEED_RECORD)) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Lo guardado, cacheado entre pedidos: la base se consulta una vez y el sitio
 * se sirve estático hasta que el panel guarda algo.
 *
 * La clave lleva la versión del formato y la huella del contenido inicial.
 * why: la caché de Next sobrevive a los deploys (y a reiniciar `next dev`).
 * Mientras no haya nada guardado, lo cacheado es `SEED_RECORD`; sin la huella,
 * un cambio de copy en `content/seed/` no se vería hasta el primer guardado
 * del panel.
 */
const getCachedRecord = unstable_cache(
  readPublishedRecord,
  ['site-record', String(SITE_RECORD_SCHEMA_VERSION), seedFingerprint()],
  { tags: [CONTENT_CACHE_TAG] },
);

/**
 * El contenido del sitio, armado (catálogo, calendario, home y páginas de
 * viaje). Lo usan el home, las páginas de viaje, el sitemap y el layout.
 *
 * `cache` de React lo arma una sola vez por pedido aunque lo pidan la página y
 * su `generateMetadata`. Si algo falla (la base no responde, lo guardado está
 * roto) el sitio se muestra con el contenido inicial y el error queda en el
 * log: nunca una página en blanco.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const today = todayInBusinessTimeZone();
  try {
    return buildSiteContent(await getCachedRecord(), today);
  } catch (error) {
    console.error('[contenido] No se pudo leer lo guardado; se muestra el respaldo.', error);
    return buildSiteContent(SEED_RECORD, today);
  }
});
