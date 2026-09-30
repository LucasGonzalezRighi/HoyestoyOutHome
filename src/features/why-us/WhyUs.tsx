import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { SurfaceCard } from '@/components/molecules/SurfaceCard';
import type { WhyUsContent } from '@/content/sections/why-us';
import { reveal } from '@/motion/attributes';

import styles from './WhyUs.module.css';

/** Props de `WhyUs`: solo su slice de contenido. */
export type WhyUsProps = {
  /** `landingContent.whyUs`. */
  content: WhyUsContent;
};

/**
 * Sección 02 "Por qué viajar con nosotros" (`dc.html:90-104`): encabezado y
 * cuatro pilares en cards que se inclinan con el cursor.
 *
 * Coreografía del diseño: el eyebrow entra desde la izquierda, el título sube
 * un escalón después (los dos los pone `SectionHeading`) y cada card sube
 * girando con un escalón más que la anterior (`data-rv="rot" data-rv-d="{{ $index }}"`).
 *
 * Los pilares van en un `<ol>`: el orden 01–04 es parte del contenido, y la
 * lista ya se lo anuncia al lector de pantalla, así que el número grande queda
 * `aria-hidden` para no leerlo dos veces.
 *
 * Server Component: la animación va por atributos, no hay estado.
 */
export function WhyUs({ content }: WhyUsProps) {
  return (
    <Container>
      <Section aria-label={content.ariaLabel}>
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          titleClassName={styles.title}
        />
        <ol className={styles.pillars}>
          {content.pillars.map((pillar, index) => (
            <li key={pillar.number} className={styles.pillarItem}>
              <SurfaceCard
                tone="surface"
                radius="lg"
                innerClassName={styles.card}
                {...reveal('rotate', { delay: index })}
              >
                <p className={styles.number} aria-hidden="true">
                  {pillar.number}
                </p>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.description}>{pillar.description}</p>
              </SurfaceCard>
            </li>
          ))}
        </ol>
      </Section>
    </Container>
  );
}
