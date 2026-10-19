import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { TRIP_SECTION_IDS } from '@/constants/sections';
import type { TripChecklistContent } from '@/content/trips';
import { reveal } from '@/motion/attributes';

import { checklistPanels } from '../../checklistPanels';
import { DetailHeading } from '../DetailHeading';
import { ServicePanel } from '../ServicePanel';
import styles from './TripChecklist.module.css';

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${TRIP_SECTION_IDS.checklist}-titulo`;

/** Props de `TripChecklist`. */
export type TripChecklistProps = {
  /** `tripDetails[slug].checklist`. */
  content: TripChecklistContent;
};

/**
 * "¿Qué incluye y qué necesito?": la checklist del viaje en una grilla de
 * cards (`dc.html:285-312`). En el home del diseño eran pestañas por viaje;
 * en la página de cada viaje hay una sola checklist, así que van sin pestañas
 * y sin estado: es un Server Component.
 */
export function TripChecklist({ content }: TripChecklistProps) {
  return (
    <Section id={TRIP_SECTION_IDS.checklist} aria-labelledby={TITLE_ID}>
      <Container>
        <DetailHeading id={TITLE_ID} eyebrow={content.eyebrow} title={content.title} />
        <div className={styles.panels}>
          {checklistPanels(content).map((panel, index) => (
            <ServicePanel
              key={panel.id}
              groups={panel.groups}
              {...reveal('up', { delay: index })}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
