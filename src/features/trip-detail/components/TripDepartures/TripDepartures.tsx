import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { TRIP_SECTION_IDS } from '@/constants/sections';
import type { TripDeparturesContent } from '@/content/trips';
import { reveal } from '@/motion/attributes';

import { DetailHeading } from '../DetailHeading';
import styles from './TripDepartures.module.css';

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${TRIP_SECTION_IDS.departures}-titulo`;

/** Props de `TripDepartures`. */
export type TripDeparturesProps = {
  /** `tripDetails[slug].departures`. */
  content: TripDeparturesContent;
};

/**
 * "Próximas salidas": las fechas de este viaje en el calendario del home,
 * cada una como una ficha con el día y el mes de salida y el rango completo
 * ("13 al 16 de noviembre"). Si el viaje no tiene fechas, no se muestra.
 *
 * El marcador (día y mes abreviado) va con `aria-hidden`: el rango que va al
 * lado ya dice la fecha entera, y el lector de pantalla la leería dos veces.
 */
export function TripDepartures({ content }: TripDeparturesProps) {
  if (content.departures.length === 0) return null;

  return (
    <Section id={TRIP_SECTION_IDS.departures} aria-labelledby={TITLE_ID}>
      <Container>
        <DetailHeading id={TITLE_ID} title={content.title} />
        <ul className={styles.list}>
          {content.departures.map((departure, index) => {
            const { day, month } = departure.marker();
            return (
              <li key={departure.id} className={styles.item} {...reveal('up', { delay: index })}>
                <span className={styles.marker} aria-hidden="true">
                  <span className={styles.markerDay}>{day}</span>
                  <span className={styles.markerMonth}>{month}</span>
                </span>
                <time dateTime={departure.startsOn} className={styles.range}>
                  {departure.rangeLabel()}
                </time>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
