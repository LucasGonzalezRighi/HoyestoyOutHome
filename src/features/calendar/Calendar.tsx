import type { CSSProperties } from 'react';

import { LinkButton } from '@/components/atoms/Button';
import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { Tag } from '@/components/atoms/Tag';
import { VisuallyHidden } from '@/components/atoms/VisuallyHidden';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { tripPath } from '@/constants/routes';
import { SECTION_IDS } from '@/constants/sections';
import type { Departure, DepartureMonth } from '@/content/catalog/departures';
import type { CalendarContent } from '@/content/sections/calendar';
import { reveal, timelineFill } from '@/motion/attributes';

import styles from './Calendar.module.css';

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${SECTION_IDS.calendar}-titulo`;

/** Escalón del reveal de la bajada: entra después del eyebrow (0) y del título (1). */
const LEAD_DELAY = 2;

/**
 * Custom properties con las que la línea de tiempo recibe sus cuentas: cuántas
 * salidas hay en total (`--stops`), cuántas tiene un mes (`--span`) y qué
 * lugar ocupa cada una (`--stop`). El CSS arma con ellas las columnas y el
 * escalón de entrada de cada tarjeta.
 */
type TimelineVars = CSSProperties & Partial<Record<'--stops' | '--span' | '--stop', number>>;

/** Tipa el objeto de `style`: `CSSProperties` no conoce las custom properties. */
function timelineVars(vars: TimelineVars): TimelineVars {
  return vars;
}

/** Un mes con la posición de su primera salida en la línea (0, 1, 2…). */
type PlacedMonth = { readonly month: DepartureMonth; readonly firstStop: number };

/**
 * Le asigna a cada mes la posición de su primera salida, contando las de los
 * meses anteriores: las salidas se numeran de corrido a lo largo de la línea,
 * sin reiniciar en cada mes.
 */
function placeMonths(months: readonly DepartureMonth[]): PlacedMonth[] {
  return months.map((month, index) => ({
    month,
    firstStop: months
      .slice(0, index)
      .reduce((count, previous) => count + previous.departures.length, 0),
  }));
}

/** Props de `Calendar`: solo su slice de contenido. */
export type CalendarProps = {
  /** `landingContent.calendar`. */
  content: CalendarContent;
};

/**
 * "Calendario": las próximas salidas sobre una línea de tiempo (`h2` de la
 * sección › `h3` del mes › `h4` de cada salida). Es el destino del link
 * "Calendario" del nav (`/#calendario`).
 *
 * El encabezado va centrado y, debajo, la línea cruza la pantalla de lado a
 * lado: cada mes es una marca sobre la línea y de cada marca cuelgan sus
 * salidas, una tarjeta compacta por salida. Si no entran todas, la fila
 * scrollea de costado (nativo, con snap). En mobile —y al imprimir— la misma
 * lista se lee de arriba abajo, con la línea a la izquierda.
 *
 * Es un solo marcado para los dos sentidos: lo único duplicado son las dos
 * líneas, que son decorativas (`aria-hidden`), y el CSS muestra una u otra.
 * La horizontal se pinta con el scroll por CSS (ver el módulo); el relleno de
 * la vertical lo escribe el motor (`timelineFill`), como en el cronograma de
 * cada viaje.
 *
 * Debajo va el aviso temporal de que las fechas son de ejemplo
 * (`placeholderNote`), mientras exista en el contenido.
 *
 * Server Component: no tiene estado.
 */
export function Calendar({ content }: CalendarProps) {
  const { eyebrow, title, lead, viewTripLabel, placeholderNote, months } = content;
  const placedMonths = placeMonths(months);
  const stops = months.reduce((count, month) => count + month.departures.length, 0);

  return (
    <Section id={SECTION_IDS.calendar} aria-labelledby={TITLE_ID}>
      <Container>
        <div className={styles.heading}>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            titleId={TITLE_ID}
            titleClassName={styles.title}
          />
          <p className={styles.lead} {...reveal('up', { delay: LEAD_DELAY })}>
            {lead}
          </p>
        </div>

        {stops > 0 ? (
          <div className={styles.timeline}>
            <div className={styles.rail} aria-hidden="true">
              <div className={styles.railFill} />
            </div>
            <div className={styles.spine} aria-hidden="true">
              <div className={styles.spineFill} {...timelineFill()} />
            </div>

            <div className={styles.scroller}>
              <ol className={styles.months} style={timelineVars({ '--stops': stops })}>
                {placedMonths.map(({ month, firstStop }) => (
                  <li
                    key={month.key}
                    className={styles.month}
                    style={timelineVars({ '--span': month.departures.length })}
                  >
                    <h3 className={styles.monthLabel}>{month.label}</h3>
                    <ol className={styles.departures}>
                      {month.departures.map((departure, index) => (
                        <DepartureCard
                          key={departure.id}
                          departure={departure}
                          stop={firstStop + index}
                          viewTripLabel={viewTripLabel}
                        />
                      ))}
                    </ol>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}

        {placeholderNote ? (
          <p className={styles.note} {...reveal('up')}>
            {placeholderNote}
          </p>
        ) : null}
      </Container>
    </Section>
  );
}

/** Props de `DepartureCard`. */
type DepartureCardProps = {
  departure: Departure;
  /** Lugar de la salida en la línea (0, 1, 2…): el escalón con el que entra su tarjeta. */
  stop: number;
  /** Texto visible del botón ("Ver viaje"). */
  viewTripLabel: string;
};

/**
 * Una salida: la fecha grande ("13 nov"), el viaje, el rango de fechas, destino
 * y duración como tags, y el botón a la página del viaje.
 *
 * La fecha muestra "13 nov" pero el lector de pantalla lee "13 de noviembre"
 * (`startLabel()`), y es un `<time>` con la fecha ISO. El título es el nombre
 * corto del viaje, que entra en un renglón de la tarjeta; el botón suma el
 * nombre completo en texto oculto: "Ver viaje" se repite en cada salida y en
 * la lista de links no se distinguirían (§9.1, "label in name").
 */
function DepartureCard({ departure, stop, viewTripLabel }: DepartureCardProps) {
  const { trip } = departure;
  const { day, month } = departure.marker();

  return (
    <li className={styles.departure} style={timelineVars({ '--stop': stop })}>
      <div className={styles.card}>
        <time className={styles.date} dateTime={departure.startsOn}>
          <span className={styles.dateFace} aria-hidden="true">
            <span className={styles.day}>{day}</span>
            <span className={styles.monthShort}>{month}</span>
          </span>
          <VisuallyHidden>{departure.startLabel()}</VisuallyHidden>
        </time>
        <h4 className={styles.trip}>{trip.shortName}</h4>
        <p className={styles.range}>{departure.rangeLabel()}</p>
        <ul className={styles.tags}>
          <li className={styles.tagItem}>
            <Tag variant="outline">{trip.destination}</Tag>
          </li>
          <li className={styles.tagItem}>
            <Tag variant="outline">{trip.duration.label()}</Tag>
          </li>
        </ul>
        <LinkButton href={tripPath(trip.slug)} variant="secondary" className={styles.cta}>
          {viewTripLabel}
          <VisuallyHidden>{` ${trip.name}`}</VisuallyHidden>
        </LinkButton>
      </div>
    </li>
  );
}
