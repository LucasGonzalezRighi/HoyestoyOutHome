import { ExternalLink, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { BRAND_LOGO } from '@/constants/assets';
import { ADMIN_ROUTES, ROUTES } from '@/constants/routes';
import { adminContent } from '@/content/admin';

import { logout } from '../../actions/auth';

import styles from './AdminShell.module.css';
import { AdminNav } from './AdminNav';

const { nav } = adminContent;

/**
 * El marco de las pantallas del panel: barra de arriba con la marca, las
 * secciones, "Ver el sitio" y "Salir". Sin nada del sitio (nav, footer,
 * motor de animación): el panel es una herramienta.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <Link href={ADMIN_ROUTES.home} className={styles.brand}>
            <Image src={BRAND_LOGO.src} alt="" width={28} height={32} />
            <span>{adminContent.brand}</span>
          </Link>
          <AdminNav />
          <div className={styles.actions}>
            <a
              href={ROUTES.home}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.action}
            >
              <ExternalLink size={16} strokeWidth={2.75} aria-hidden="true" />
              <span className={styles.actionLabel}>{nav.viewSite}</span>
            </a>
            <form action={logout}>
              <button type="submit" className={styles.action}>
                <LogOut size={16} strokeWidth={2.75} aria-hidden="true" />
                <span className={styles.actionLabel}>{nav.logout}</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

/**
 * El encabezado de una pantalla del panel: título, bajada y, a la derecha,
 * sus acciones (por ejemplo, "Nuevo viaje").
 */
export function AdminPage({
  title,
  lead,
  back,
  actions,
  children,
}: {
  title: string;
  lead?: string;
  /** Link para volver (al listado de viajes, desde el editor). */
  back?: { href: string; label: string };
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          {back && (
            <Link href={back.href} className={styles.back}>
              ← {back.label}
            </Link>
          )}
          <h1 className={styles.title}>{title}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
        </div>
        {actions && <div className={styles.pageActions}>{actions}</div>}
      </div>
      {children}
    </>
  );
}
