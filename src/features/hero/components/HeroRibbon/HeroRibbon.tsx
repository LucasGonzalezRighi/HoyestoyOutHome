import { Dot } from '@/components/atoms/Dot';
import { Marquee } from '@/components/organisms/Marquee';

import styles from './HeroRibbon.module.css';

/** Props de `HeroRibbon`. */
export type HeroRibbonProps = {
  /** Palabras de la cinta, una sola vez (el `Marquee` las duplica). */
  items: readonly string[];
};

/** Las palabras de la cinta no se repiten: cada una es su propia clave. */
function itemKey(item: string): string {
  return item;
}

/**
 * La cinta verde musgo que cruza la página, levemente girada, debajo del hero
 * (`dc.html:80-86`): las palabras de la marca corren hacia la izquierda,
 * separadas por un punto dorado. El scroll la acelera e inclina, y se frena
 * con el mouse encima (todo lo hace el motor, `MarqueeEffect`).
 *
 * Es decorativa entera (`aria-hidden`, como en el diseño): repite lo que ya
 * dicen el hero y las secciones. Por eso tampoco hace falta ocultar la copia
 * del `Marquee` ítem por ítem.
 */
export function HeroRibbon({ items }: HeroRibbonProps) {
  return (
    <div className={styles.ribbon} aria-hidden="true">
      <Marquee
        items={items}
        getKey={itemKey}
        className={styles.rail}
        renderItem={(item) => (
          <span className={styles.item}>
            {item}
            <Dot size={12} tone="accent-400" />
          </span>
        )}
      />
    </div>
  );
}
