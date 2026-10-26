'use client';

import { Button } from '@/components/atoms/Button';
import { adminContent } from '@/content/admin';

import styles from './admin.module.css';

/**
 * Lo que se ve si una acción del panel falla de forma inesperada (por ejemplo,
 * la base no responde al ordenar los viajes). El detalle queda en el log del
 * servidor.
 */
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  const { error: copy } = adminContent;
  return (
    <div className={styles.center}>
      <div className={styles.panel} role="alert">
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.lead}>{copy.text}</p>
        <Button type="button" onClick={reset}>
          {copy.retry}
        </Button>
      </div>
    </div>
  );
}
