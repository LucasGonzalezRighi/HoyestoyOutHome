import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { SECTION_IDS } from '@/constants/sections';
import type { LologContent } from '@/content/sections/lolog';
import { reveal } from '@/motion/attributes';

import { StageCard } from './components/StageCard';
import { StatCard } from './components/StatCard';
import styles from './Lolog.module.css';

/**
 * Cuánto dura la entrada de cada párrafo de la descripción: el 20% del
 * viewport (`data-rv-span="0.2"`, `dc.html:231`), un poco más lenta que la de
 * por defecto (0.16) porque son bloques largos.
 */
const PARAGRAPH_REVEAL_SPAN = 0.2;

/** Props de `Lolog`: solo su slice de contenido. */
export type LologProps = {
  /** `landingContent.lolog`. */
  content: LologContent;
};

/**
 * Sección 07 — "Lago Lolog a Laguna Verde" (`dc.html:224-269`), el destino
 * del ancla `#lolog` del nav y de la card del viaje.
 *
 * Tres bloques:
 * 1. Encabezado: eyebrow, título y bajada en itálica, entrando escalonados.
 * 2. Dos columnas: la descripción a la izquierda y, a la derecha, las cuatro
 *    stats con contador fijadas (sticky) mientras se lee. En mobile, una
 *    columna y sin sticky.
 * 3. El itinerario: cinco cards sticky que se apilan una sobre otra
 *    (`StageCard`, animadas por el `StackEffect` del motor).
 *
 * Server Component: todo el movimiento va por atributos.
 */
export function Lolog({ content }: LologProps) {
  const { itinerary } = content;

  return (
    <Section id={SECTION_IDS.lolog}>
      <Container>
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          titleClassName={styles.title}
        />
        <p className={styles.subtitle} {...reveal('up', { delay: 2 })}>
          {content.subtitle}
        </p>

        <div className={styles.split}>
          <div className={styles.description}>
            {content.description.map((paragraph, index) => (
              <p
                key={paragraph}
                className={styles.paragraph}
                {...reveal('up', { delay: index, span: PARAGRAPH_REVEAL_SPAN })}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className={styles.aside}>
            <ul className={styles.stats}>
              {content.stats.map((metric, index) => (
                <StatCard key={metric.label} metric={metric} revealDelay={index} />
              ))}
            </ul>
            {/* Entra después de la última stat (`data-rv-d="4"` con cuatro stats, `dc.html:242`). */}
            <p className={styles.modality} {...reveal('up', { delay: content.stats.length })}>
              {content.modality}
            </p>
          </div>
        </div>

        <h3 className={styles.itineraryTitle} {...reveal('up')}>
          {itinerary.title}
        </h3>
        <ol className={styles.stages}>
          {itinerary.stages.map((stage, index) => (
            <StageCard
              key={stage.day}
              stage={stage}
              index={index}
              metricLabels={itinerary.metricLabels}
            />
          ))}
        </ol>
      </Container>
    </Section>
  );
}
