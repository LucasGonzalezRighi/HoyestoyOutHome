import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { adminContent } from '@/content/admin';

/**
 * El panel de administración no se indexa ni se comparte: `noindex` además del
 * `Disallow` de `robots.txt` y del encabezado `X-Robots-Tag` del proxy.
 */
export const metadata: Metadata = {
  title: adminContent.meta.title,
  robots: { index: false, follow: false },
};

/**
 * Todo `/admin`: la pantalla de entrada y las del panel (`(panel)/layout.tsx`,
 * que pide sesión). Sin nada del sitio: ni nav, ni footer, ni motor de
 * animación (eso vive en `(site)/layout.tsx`).
 */
export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
