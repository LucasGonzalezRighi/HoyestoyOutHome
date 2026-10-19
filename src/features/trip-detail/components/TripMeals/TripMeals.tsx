import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { WashedImage } from '@/components/atoms/WashedImage';
import { TRIP_SECTION_IDS } from '@/constants/sections';
import type { TripMealsContent } from '@/content/trips';
import { reveal } from '@/motion/attributes';

import styles from './TripMeals.module.css';

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${TRIP_SECTION_IDS.meals}-titulo`;

/**
 * Cuánto del viewport dura la entrada de cada plato (`data-rv-span="0.45"`,
 * `dc.html:276`). Es casi el triple del normal (0.16): el giro de 300° del
 * `roll` necesita recorrido para leerse como una rueda y no como un salto.
 */
const MEAL_REVEAL_SPAN = 0.45;

/** El plato mide `min(220px, 100%)` (`dc.html:277`): nunca pide más de 220px de foto. */
const PLATE_SIZES = '220px';

/** Props de `TripMeals`. */
export type TripMealsProps = {
  /** `tripDetails[slug].meals`. */
  content: TripMealsContent;
};

/**
 * "Pensión completa" (`dc.html:271-283`): las cuatro comidas del día en platos
 * redondos que entran rodando desde la izquierda, uno detrás del otro, y la
 * nota del asterisco con lo propio del viaje.
 *
 * Al pasar el cursor, el plato crece, gira y se deforma en una mancha: el
 * "formas blandas como máscara de imágenes" del design system Organic.
 *
 * Server Component: la aparición la maneja el motor por atributos y el hover
 * es CSS puro.
 */
export function TripMeals({ content }: TripMealsProps) {
  return (
    <Section id={TRIP_SECTION_IDS.meals} aria-labelledby={TITLE_ID}>
      <Container>
        <p className={styles.kicker} {...reveal('left')}>
          {content.kicker}
        </p>
        <h2 id={TITLE_ID} className={styles.title} {...reveal('up', { delay: 1 })}>
          {content.title}
        </h2>

        <ul className={styles.grid}>
          {content.meals.map((meal, index) => (
            <li key={meal.name}>
              <figure
                className={styles.meal}
                {...reveal('roll', { delay: index, span: MEAL_REVEAL_SPAN })}
              >
                <WashedImage
                  photo={meal.photo}
                  tone="none"
                  sizes={PLATE_SIZES}
                  className={styles.plate}
                  imageClassName={styles.plateImage}
                />
                <figcaption className={styles.caption}>{meal.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <p className={styles.footnote} {...reveal('up')}>
          {content.footnote}
        </p>
      </Container>
    </Section>
  );
}
