import { LinkButton } from '@/components/atoms/Button';
import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon';
import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { SurfaceCard } from '@/components/molecules/SurfaceCard';
import {
  Timeline,
  TimelineItem,
  TimelinePhoto,
  TimelineTags,
  TimelineText,
} from '@/components/organisms/Timeline';
import { TRIP_SECTION_IDS } from '@/constants/sections';
import type { TripComingSoonContent, TripScheduleContent } from '@/content/trips';
import type { ItineraryDay } from '@/domain';
import { reveal } from '@/motion/attributes';

import { DetailHeading } from '../DetailHeading';
import styles from './TripSchedule.module.css';

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${TRIP_SECTION_IDS.schedule}-titulo`;

/** Lado del ícono del CTA de "Itinerario próximamente". */
const CTA_ICON_SIZE = 18;

/** Props de `TripSchedule`. */
export type TripScheduleProps = {
  /** `tripDetails[slug].schedule`. */
  content: TripScheduleContent;
};

/**
 * "Cronograma": el itinerario día por día como línea de tiempo (`Timeline`),
 * con la foto de cada día cuando la hay (Lago Lolog). Si el viaje todavía no
 * tiene itinerario, en su lugar va el aviso "Itinerario próximamente".
 *
 * Es el destino del CTA "Ver cronograma" de la portada (`#cronograma`).
 * Jerarquía: `<h2>` "Cronograma" › `<h3>` cada día (o el aviso).
 */
export function TripSchedule({ content }: TripScheduleProps) {
  const { title, subtitle, days, comingSoon } = content;

  return (
    <Section id={TRIP_SECTION_IDS.schedule} aria-labelledby={TITLE_ID}>
      <Container>
        <DetailHeading id={TITLE_ID} title={title} subtitle={subtitle} />
        {days.length > 0 ? <ScheduleTimeline days={days} /> : <ComingSoon content={comingSoon} />}
      </Container>
    </Section>
  );
}

/**
 * La línea de tiempo: un ítem por día, con el número del día en el círculo
 * ("1", "0") y "Día 1" para el lector de pantalla, sus párrafos, sus stats en
 * tags ("4 km", "280 m desnivel", "2 hs de marcha") y su foto si tiene.
 */
function ScheduleTimeline({ days }: { days: readonly ItineraryDay[] }) {
  return (
    <Timeline aria-labelledby={TITLE_ID} className={styles.timeline}>
      {days.map((day, index) => (
        <TimelineItem
          key={day.day}
          marker={{ value: day.markerLabel(), label: day.dayLabel() }}
          title={day.title}
          headingLevel={3}
          delay={index}
        >
          {day.paragraphs.map((paragraph) => (
            <TimelineText key={paragraph}>{paragraph}</TimelineText>
          ))}
          <TimelineTags items={day.statLabels()} />
          {day.photo ? <TimelinePhoto photo={day.photo} /> : null}
        </TimelineItem>
      ))}
    </Timeline>
  );
}

/** El aviso para los viajes sin itinerario: qué pasa y el botón para consultar. */
function ComingSoon({ content }: { content: TripComingSoonContent }) {
  return (
    <SurfaceCard
      tone="accent-100"
      radius="xl"
      className={styles.comingSoon}
      innerClassName={styles.comingSoonCard}
      {...reveal('up')}
    >
      <h3 className={styles.comingSoonTitle}>{content.title}</h3>
      <p className={styles.comingSoonText}>{content.text}</p>
      <LinkButton
        href={content.cta.href}
        external={content.cta.external}
        variant="primary"
        icon={<WhatsAppIcon size={CTA_ICON_SIZE} />}
      >
        {content.cta.label}
      </LinkButton>
    </SurfaceCard>
  );
}
