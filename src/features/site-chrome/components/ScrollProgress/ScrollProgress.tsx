import { scrollProgress } from '@/motion/attributes';

import styles from './ScrollProgress.module.css';

/**
 * Barra de progreso de lectura, fija arriba de todo (`dc.html:37`). Arranca en
 * cero y la escala el motor (`ScrollProgressEffect`) según el scroll de la
 * página. Decorativa: el progreso ya lo da la barra de scroll del navegador.
 */
export function ScrollProgress() {
  return <div className={styles.bar} aria-hidden="true" {...scrollProgress()} />;
}
