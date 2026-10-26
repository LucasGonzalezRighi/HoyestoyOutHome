import Image from 'next/image';
import { redirect } from 'next/navigation';

import { BRAND_LOGO } from '@/constants/assets';
import { ADMIN_ROUTES, ROUTES } from '@/constants/routes';
import { adminContent } from '@/content/admin';
import { LoginForm } from '@/features/admin';
import { readAdminConfig } from '@/server/auth/adminConfig';
import { readSession } from '@/server/auth/session';

import styles from '../admin.module.css';

/** Props de la página: en Next 16 los `searchParams` llegan como Promise. */
type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

/**
 * Entrada al panel. Con sesión abierta, pasa directo al inicio del panel. Si
 * al servidor le faltan las variables de la entrada, lo dice (solo los
 * nombres, nunca valores).
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await readSession()) redirect(ADMIN_ROUTES.home);
  const { next } = await searchParams;
  const admin = readAdminConfig();
  const { login: copy } = adminContent;

  return (
    <main className={styles.center}>
      <div className={styles.panel}>
        <Image src={BRAND_LOGO.src} alt="" width={56} height={65} className={styles.logo} preload />
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.lead}>{copy.lead}</p>
        {admin.ok ? (
          <LoginForm next={typeof next === 'string' ? next : undefined} />
        ) : (
          <p className={styles.missing} role="alert">
            {copy.notConfigured} <code>{admin.missing.join(', ')}</code>.
          </p>
        )}
        <a href={ROUTES.home} className={styles.back}>
          {copy.backToSite}
        </a>
      </div>
    </main>
  );
}
