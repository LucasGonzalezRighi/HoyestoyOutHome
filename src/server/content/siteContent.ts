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
 * Lo guardado, cacheado entre pedidos: la base se consulta una vez y el sitio
 * se sirve estático hasta que el panel guarda algo. La versión del formato va
 * en la clave para que un deploy que cambia la forma no lea la caché vieja.
 */
const getCachedRecord = unstable_cache(
  readPublishedRecord,
  ['site-record', String(SITE_RECORD_SCHEMA_VERSION)],
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
