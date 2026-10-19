import { Container } from '@/components/atoms/Container';
import { Dot } from '@/components/atoms/Dot';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Section } from '@/components/atoms/Section';
import { SECTION_IDS } from '@/constants/sections';
import type { TripsContent } from '@/content/sections/trips';
import { reveal } from '@/motion/attributes';

import { TripPanel } from './components/TripPanel';
import { TripsFan } from './components/TripsFan';
import styles from './TripsShowcase.module.css';

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${SECTION_IDS.trips}-titulo`;

/** Props de `TripsShowcase`: solo su slice de contenido. */
export type TripsShowcaseProps = {
  /** `landingContent.trips`. */
  content: TripsContent;
};

/**
 * Sección "Próximos viajes" del home: un abanico de paneles de foto, uno por
 * viaje, con el encabezado partido en dos columnas.
 *
 * - **Encabezado**: a la izquierda, eyebrow y título; a la derecha, alineados
 *   con la base del título, la bajada, tres datos generales y los controles
 *   (contador y flechas, que pone `TripsFan`).
 * - **Abanico** (`TripsFan`): los viajes lado a lado, a lo ancho del
 *   contenedor. El panel abierto muestra destino, nombre, tags y el botón
 *   "Ver detalles" a la página del viaje; los demás quedan como franjas de
 *   foto con su nombre. En el celular, el mismo abanico en vertical.
 *
 * Reemplaza al carrusel de cards (rediseño de octubre de 2026): el cliente lo
 * veía descentrado, porque arrancaba en el contenedor y se iba por la
 * derecha. El abanico es simétrico y muestra los cuatro viajes de entrada.
 * Tampoco hay precios en el home: viven en la página de cada viaje.
 *
 * La sección toma su nombre del título (`aria-labelledby`). Para el lector de
 * pantalla es una lista de viajes, cada uno con su `h3`, sus datos y su link:
 * no hay nada que abrir para leerla (ver `TripPanel`).
 *
 * Server Component: lo único con estado es qué panel está abierto, y eso es
 * de `TripsFan`, que recibe el encabezado y los paneles ya renderizados.
 */
export function TripsShowcase({ content }: TripsShowcaseProps) {
  return (
    <Section id={SECTION_IDS.trips} aria-labelledby={TITLE_ID}>
      <Container>
        <TripsFan
          heading={
            <>
              <Eyebrow {...reveal('left')}>{content.eyebrow}</Eyebrow>
              <h2 id={TITLE_ID} className={styles.title} {...reveal('up', { delay: 1 })}>
                {content.title}
              </h2>
            </>
          }
          intro={
            <>
              <p className={styles.lead} {...reveal('up', { delay: 2 })}>
                {content.lead}
              </p>
              <ul className={styles.facts} {...reveal('up', { delay: 3 })}>
                {content.facts.map((fact) => (
                  <li key={fact} className={styles.fact}>
                    <Dot size={7} tone="accent-2" />
                    {fact}
                  </li>
                ))}
              </ul>
            </>
          }
          labels={content.controls}
          items={content.panels.map((panel, index) => ({
            id: panel.trip.slug,
            positionLabel: panel.positionLabel,
            content: <TripPanel panel={panel} index={index} />,
          }))}
        />
      </Container>
    </Section>
  );
}
