import { cursor } from '@/motion/attributes';

import styles from './CustomCursor.module.css';

/**
 * Cursor montaña (`dc.html:36`): sol, cerro y nieve, 30×24.
 *
 * Arranca oculto. El motor (`CursorEffect`) lo muestra y lo mueve solo si hay
 * un mouse de verdad, y recién ahí se oculta el cursor del sistema: si el JS
 * falla o es una pantalla táctil, queda el cursor normal.
 */
export function CustomCursor() {
  return (
    <div className={styles.cursor} aria-hidden="true" {...cursor()}>
      <svg className={styles.icon} width="30" height="24" viewBox="0 0 30 24" fill="none">
        <circle className={styles.sun} cx="23" cy="6" r="4" />
        <path className={styles.peak} d="M1 22 L12 3 L17 11 L20 7 L29 22 Z" />
        <path className={styles.snow} d="M8.6 9 L12 3 L15.4 9 L13.6 8 L12 9.6 L10.4 8 Z" />
      </svg>
    </div>
  );
}
