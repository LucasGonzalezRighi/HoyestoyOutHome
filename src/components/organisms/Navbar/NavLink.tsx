import styles from './Navbar.module.css';

/** Props de `NavLink`. */
export type NavLinkProps = {
  href: string;
  label: string;
};

/**
 * Link del nav con "label swap": el texto está dos veces, apilado dentro de
 * una ventana de una línea; en hover la pila sube y asoma la copia dorada.
 *
 * La copia va con `aria-hidden` para que el nombre accesible del link sea el
 * label una sola vez.
 */
export function NavLink({ href, label }: NavLinkProps) {
  return (
    <a href={href} className={styles.link}>
      <span className={styles.labelWindow}>
        <span className={styles.labelStack}>
          <span className={styles.label}>{label}</span>
          <span className={styles.labelHover} aria-hidden="true">
            {label}
          </span>
        </span>
      </span>
    </a>
  );
}
