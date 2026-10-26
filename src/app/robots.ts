import type { MetadataRoute } from 'next';

import { ADMIN_ROUTES } from '@/constants/routes';
import { SITE_URL } from '@/constants/siteUrl';

/** `/robots.txt`: todo el sitio es indexable (es una sola página pública). */
export default function robots(): MetadataRoute.Robots {
  return {
    // El panel de administración no se indexa (además pide sesión y lleva `noindex`).
    rules: { userAgent: '*', allow: '/', disallow: ADMIN_ROUTES.home },
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  };
}
