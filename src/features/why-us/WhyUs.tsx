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
 * cuatro pilares en cards que se inclinan con el cursor, todas del mismo alto.
 *
 * Coreografía del diseño: el eyebrow entra desde la izquierda, el título sube
 * un escalón después (los dos los pone `SectionHeading`) y cada card sube
 * girando con un escalón más que la anterior (`data-rv="rot" data-rv-d="{{ $index }}"`).
 *
 * En el diseño cada card abre con un número grande (01–04) y los pilares van
 * en una lista ordenada. A pedido del cliente las cards van sin número: sin un
 * orden a la vista, los pilares son una lista sin orden (`<ul>`).
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
        <ul className={styles.pillars}>
          {content.pillars.map((pillar, index) => (
            <li key={pillar.title} className={styles.pillarItem}>
              <SurfaceCard
                tone="surface"
                radius="lg"
                innerClassName={styles.card}
                {...reveal('rotate', { delay: index })}
              >
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.description}>{pillar.description}</p>
              </SurfaceCard>
            </li>
          ))}
        </ul>
      </Section>
    </Container>
  );
}
