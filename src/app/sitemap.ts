import type { MetadataRoute } from 'next';

import { tripPath } from '@/constants/routes';
import { SITE_URL } from '@/constants/siteUrl';
import { tripCatalog } from '@/content/catalog/trips';

/**
 * `/sitemap.xml`: el home y la página de cada viaje del catálogo
 * (`/viajes/<slug>`). Las secciones del home son anclas de la misma página, y
 * los buscadores no indexan fragmentos (`#viajes`).
 *
 * Sin `lastModified`: el contenido es estático y la fecha del build no dice
 * cuándo cambió de verdad.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL.toString(), changeFrequency: 'monthly', priority: 1 },
    ...tripCatalog.all().map((trip) => ({
      url: new URL(tripPath(trip.slug), SITE_URL).toString(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
