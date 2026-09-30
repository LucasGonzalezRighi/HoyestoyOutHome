import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { Marquee } from '@/components/organisms/Marquee';
import type { TestimonialsContent } from '@/content/sections/testimonials';
import { reveal } from '@/motion/attributes';

import { TestimonialCard } from './components/TestimonialCard';
import styles from './Testimonials.module.css';

/**
 * La cinta de testimonios: `data-marquee="1" data-marquee-speed="0.6"`
 * (`dc.html:333`). Va hacia la izquierda y un poco más lenta que las otras
 * cintas de la página (0.7 por defecto): es la única con frases para leer.
 */
const TESTIMONIALS_MARQUEE = { direction: 1, speed: 0.6 } as const;

/** Props de `Testimonials`: solo su slice de contenido. */
export type TestimonialsProps = {
  /** `landingContent.testimonials`. */
  content: TestimonialsContent;
};

/**
 * Sección 11, "Lo que se traen de la montaña" (`dc.html:330-343`): los
 * testimonios en una cinta infinita que ocupa todo el ancho de la pantalla.
 *
 * El diseño trae además un carrusel por intervalo (`tRef`, `goT`, `tDots`)
 * que su marcado no usa; no se portó (CLAUDE.md §9).
 */
export function Testimonials({ content }: TestimonialsProps) {
  return (
    <Section aria-label={content.ariaLabel}>
      <Container>
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          titleClassName={styles.title}
        />
        <div className={styles.viewport} {...reveal('up', { delay: 1 })}>
          <Marquee
            as="ul"
            items={content.testimonials}
            direction={TESTIMONIALS_MARQUEE.direction}
            speed={TESTIMONIALS_MARQUEE.speed}
            className={styles.rail}
            renderItem={(testimonial, { isClone }) => (
              // La copia de la cinta no se lee: el lector de pantalla ya leyó la original.
              <li className={styles.item} aria-hidden={isClone || undefined}>
                <TestimonialCard
                  testimonial={testimonial}
                  captionSeparator={content.captionSeparator}
                />
              </li>
            )}
          />
        </div>
      </Container>
    </Section>
  );
}
