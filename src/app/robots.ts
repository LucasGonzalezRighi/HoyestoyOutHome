import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/constants/siteUrl';

/** `/robots.txt`: todo el sitio es indexable (es una sola página pública). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  };
}
