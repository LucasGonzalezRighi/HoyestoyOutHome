import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { TRIP_SECTION_IDS } from '@/constants/sections';
import type { TripOverviewContent } from '@/content/trips';
import { reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import { DetailHeading } from '../DetailHeading';
import { StatCard } from '../StatCard';
import styles from './TripOverview.module.css';

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${TRIP_SECTION_IDS.overview}-titulo`;

/**
 * Cuánto dura la entrada de cada párrafo: el 20% del viewport
 * (`data-rv-span="0.2"`, `dc.html:231`), un poco más lenta que la de por
 * defecto (0.16) porque son bloques largos.
 */
const PARAGRAPH_REVEAL_SPAN = 0.2;

/** Props de `TripOverview`. */
export type TripOverviewProps = {
  /** `tripDetails[slug].overview`. */
  content: TripOverviewContent;
};

/**
 * "Sobre el viaje": la presentación y las stats con contador.
 *
 * Con párrafos, dos columnas como Lago Lolog en el diseño (`dc.html:229-243`):
 * el texto a la izquierda y las stats a la derecha, fijas (sticky) mientras se
 * lee. Sin párrafos (los viajes que todavía no tienen programa), las stats van
 * solas en una fila.
 *
 * Server Component: el movimiento va por atributos.
 */
export function TripOverview({ content }: TripOverviewProps) {
  const { title, paragraphs, highlight, modality, stats } = content;
  const hasText = paragraphs.length > 0 || highlight !== undefined;

  return (
    <Section id={TRIP_SECTION_IDS.overview} aria-labelledby={TITLE_ID}>
      <Container>
        <DetailHeading id={TITLE_ID} title={title} />

        <div className={cn(hasText && styles.split)}>
          {hasText ? (
            <div className={styles.text}>
              {paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={styles.paragraph}
                  {...reveal('up', { delay: index, span: PARAGRAPH_REVEAL_SPAN })}
                >
                  {paragraph}
                </p>
              ))}
              {highlight ? (
                <p className={styles.highlight} {...reveal('up', { delay: paragraphs.length })}>
                  {highlight}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className={cn(styles.aside, hasText && styles.asideSticky)}>
            <ul className={cn(styles.stats, !hasText && styles.statsRow)} aria-label={stats.label}>
              {stats.items.map((metric, index) => (
                <StatCard key={metric.label} metric={metric} revealDelay={index} />
              ))}
            </ul>
            {modality ? (
              <p className={styles.modality} {...reveal('up', { delay: stats.items.length })}>
                {modality}
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
