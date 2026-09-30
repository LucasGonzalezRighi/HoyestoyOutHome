import { BrandLogo } from '@/components/atoms/BrandLogo';
import { MOTION_SELECTORS, curtain } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './Curtain.module.css';

/** Ancho del logo dentro de su caja (`dc.html:30`). */
const LOGO_WIDTH = 118;

/**
 * Sin JS el telón no se levanta nunca: se saca del medio de entrada. Va como
 * `<style>` dentro de `<noscript>` porque es la única forma de que una regla
 * aplique solo cuando el JS está deshabilitado.
 */
const NO_SCRIPT_CSS = `${MOTION_SELECTORS.curtain}{display:none!important}`;

/** Props de `Curtain`: los dos textos del telón, desde `siteContent.curtain`. */
export type CurtainProps = {
  /** Nombre de la marca debajo del logo. */
  title: string;
  /** Texto alternativo del logo. */
  logoAlt: string;
};

/**
 * Telón de entrada (`dc.html:25-34`): dos hojas verde musgo que tapan la
 * página con el logo al centro. `CurtainController` (en `src/motion/intro/`)
 * decide cuándo se abre; acá solo está el marcado y las transiciones.
 *
 * Es decorativo (`aria-hidden`): el contenido real está debajo y un lector de
 * pantalla no tiene por qué esperar a que se abra.
 */
export function Curtain({ title, logoAlt }: CurtainProps) {
  return (
    <>
      <div className={styles.curtain} aria-hidden="true" {...curtain.root()}>
        <div className={cn(styles.leaf, styles.leafLeft)} {...curtain.leaf('left')} />
        <div className={cn(styles.leaf, styles.leafRight)} {...curtain.leaf('right')} />
        <div className={styles.brand} {...curtain.logo()}>
          <div className={styles.logoFrame}>
            <BrandLogo width={LOGO_WIDTH} alt={logoAlt} priority />
          </div>
          <p className={styles.title}>{title}</p>
        </div>
      </div>
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
    </>
  );
}
