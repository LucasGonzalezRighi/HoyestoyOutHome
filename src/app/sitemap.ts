import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/constants/site';

/**
 * `/sitemap.xml`: una sola URL, la landing. Las secciones son anclas de la
 * misma página, y los buscadores no indexan fragmentos (`#viajes`).
 *
 * Sin `lastModified`: el contenido es estático y la fecha del build no dice
 * cuándo cambió de verdad.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL.toString(), changeFrequency: 'monthly', priority: 1 }];
}
