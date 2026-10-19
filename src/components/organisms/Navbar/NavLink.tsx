import Link from 'next/link';

import styles from './Navbar.module.css';

/** Props de `NavLink`. */
export type NavLinkProps = {
  /** Destino interno: una sección del home (`/#id`). */
  href: string;
  label: string;
};

/**
 * Link del nav con "label swap": el texto está dos veces, apilado dentro de
 * una ventana de una línea; en hover la pila sube y asoma la copia dorada.
 *
 * Es el `Link` de Next y no un `<a>` común: el nav se ve en todas las páginas,
 * y desde una página de viaje "Viajes" (`/#viajes`) vuelve al home sin
 * recargar el documento (ni las fuentes, ni el motor). En el home el router lo
 * resuelve como un salto dentro de la página, con el scroll suave del `<html>`.
 *
 * La copia va con `aria-hidden` para que el nombre accesible del link sea el
 * label una sola vez.
 */
export function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link href={href} className={styles.link}>
      <span className={styles.labelWindow}>
        <span className={styles.labelStack}>
          <span className={styles.label}>{label}</span>
          <span className={styles.labelHover} aria-hidden="true">
            {label}
          </span>
        </span>
      </span>
    </Link>
  );
}
