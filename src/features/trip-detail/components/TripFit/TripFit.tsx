import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { TRIP_SECTION_IDS } from '@/constants/sections';
import type { TripFitContent } from '@/content/trips';

import { AudienceCard } from '../AudienceCard';
import { RequirementsCard } from '../RequirementsCard';
import styles from './TripFit.module.css';

/** `id` del título de "¿Puedo?". */
const REQUIREMENTS_TITLE_ID = `${TRIP_SECTION_IDS.fit}-puedo`;

/** `id` del título de "¿Es para mí?". */
const AUDIENCE_TITLE_ID = `${TRIP_SECTION_IDS.fit}-es-para-mi`;

/** Props de `TripFit`. */
export type TripFitProps = {
  /** `tripDetails[slug].fit`. */
  content: TripFitContent;
};

/**
 * "¿Puedo?" / "¿Es para mí?" (`dc.html:181-211`): las dos cards que responden
 * si el viaje es para vos, lado a lado.
 *
 * No tiene un título propio (el diseño no lo trae): cada pregunta es un
 * `<h2>`, y la sección se nombra con los dos (`aria-labelledby` con los dos
 * ids), así en la lista de regiones se oye "¿Puedo? ¿Es para mí?".
 */
export function TripFit({ content }: TripFitProps) {
  return (
    <Section
      id={TRIP_SECTION_IDS.fit}
      aria-labelledby={`${REQUIREMENTS_TITLE_ID} ${AUDIENCE_TITLE_ID}`}
    >
      <Container className={styles.grid}>
        <RequirementsCard content={content.requirements} titleId={REQUIREMENTS_TITLE_ID} />
        <AudienceCard content={content.audience} titleId={AUDIENCE_TITLE_ID} revealDelay={1} />
      </Container>
    </Section>
  );
}
