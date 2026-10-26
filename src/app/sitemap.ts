import type { MetadataRoute } from 'next';

import { tripPath } from '@/constants/routes';
import { SITE_URL } from '@/constants/siteUrl';
import { getSiteContent } from '@/server/content/siteContent';

/**
 * `/sitemap.xml`: el home y la página de cada viaje visible
 * (`/viajes/<slug>`). Las secciones del home son anclas de la misma página, y
 * los buscadores no indexan fragmentos (`#viajes`). El panel de
 * administración no va.
 *
 * Sin `lastModified`: la fecha del último guardado del panel no dice qué
 * página cambió.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { catalog } = await getSiteContent();
  return [
    { url: SITE_URL.toString(), changeFrequency: 'monthly', priority: 1 },
    ...catalog.all().map((trip) => ({
      url: new URL(tripPath(trip.slug), SITE_URL).toString(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
