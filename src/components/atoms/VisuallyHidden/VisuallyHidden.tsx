import type { ReactNode } from 'react';

import styles from './VisuallyHidden.module.css';

/** Props de `VisuallyHidden`. */
export type VisuallyHiddenProps = {
  /** El texto que solo lee el lector de pantalla. */
  children: ReactNode;
};

/**
 * Texto que no se ve pero que el lector de pantalla lee.
 *
 * Para cuando lo visible no alcanza o no sirve como texto: el valor final de un
 * contador animado (el visible va con `aria-hidden`, porque el motor lo pone en
 * 0 y lo sube al entrar en pantalla) o el nombre del viaje en un CTA que se
 * repite ("Ver viaje"). Va como `<span>`, así entra en párrafos y links.
 */
export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className={styles.visuallyHidden}>{children}</span>;
}
