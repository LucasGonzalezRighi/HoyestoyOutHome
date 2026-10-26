'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ADMIN_ROUTES } from '@/constants/routes';
import { adminContent } from '@/content/admin';
import { cn } from '@/utils/cn';

import styles from './AdminShell.module.css';

const { nav } = adminContent;

/**
 * Las secciones del panel. Es cliente solo para marcar la actual
 * (`aria-current`): el layout no sabe en qué ruta está.
 */
export function AdminNav() {
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    href === ADMIN_ROUTES.home ? pathname === href : pathname.startsWith(href);

  return (
    <nav aria-label={nav.label} className={styles.nav}>
      <ul className={styles.navList}>
        {nav.links.map(({ key, label }) => {
          const href = ADMIN_ROUTES[key];
          const current = isCurrent(href);
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={current ? 'page' : undefined}
                className={cn(styles.navLink, current && styles.navLinkCurrent)}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
