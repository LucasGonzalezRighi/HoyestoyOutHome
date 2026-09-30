import { Eyebrow } from '@/components/atoms/Eyebrow';
import { SECTION_IDS } from '@/constants/sections';
import type { TripsContent } from '@/content/sections/trips';
import { horizontalScroll } from '@/motion/attributes';

import { TripCard } from './components/TripCard';
import styles from './TripsShowcase.module.css';

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${SECTION_IDS.trips}-titulo`;

/** Props de `TripsShowcase`: solo su slice de contenido. */
export type TripsShowcaseProps = {
  /** `landingContent.trips`. */
  content: TripsContent;
};

/**
 * Sección 03 "Próximos viajes" (`dc.html:107-139`): scroll horizontal fijado.
 *
 * Mientras se scrollea hacia abajo, la escena queda fija (`position: sticky`)
 * y el riel con el encabezado y las cards se desplaza hacia la izquierda; una
 * barra abajo marca el avance. El motor (`HorizontalScrollEffect`) estira la
 * sección hasta "lo que le sobra al riel + un viewport", traslada el riel y
 * escala la barra: acá solo se marcan las tres piezas con `horizontalScroll`.
 *
 * Dentro del riel no hay reveals (en el diseño tampoco): el riel ya se mueve,
 * y una aparición encima competiría con el desplazamiento.
 *
 * Es un `<section>` propio y no `Container` + `Section`: el riel va de borde a
 * borde de la pantalla, y el aire de arriba es `margin-top` (un `padding`
 * entraría en el alto que fija el motor y correría la escena).
 *
 * Server Component: la animación va por atributos, no hay estado.
 */
export function TripsShowcase({ content }: TripsShowcaseProps) {
  return (
    <section
      id={SECTION_IDS.trips}
      aria-labelledby={TITLE_ID}
      className={styles.section}
      {...horizontalScroll.section()}
    >
      <div className={styles.stage}>
        <div className={styles.track} {...horizontalScroll.track()}>
          <div className={styles.intro}>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 id={TITLE_ID} className={styles.title}>
              {content.title}
            </h2>
            <p className={styles.lead}>{content.lead}</p>
          </div>
          <ul className={styles.cards}>
            {content.cards.map((card) => (
              <li key={card.trip.slug} className={styles.cardItem}>
                <TripCard card={card} />
              </li>
            ))}
          </ul>
          <div className={styles.endSpacer} aria-hidden="true" />
        </div>
        <div className={styles.progress} aria-hidden="true">
          <div className={styles.progressFill} {...horizontalScroll.bar()} />
        </div>
      </div>
    </section>
  );
}
