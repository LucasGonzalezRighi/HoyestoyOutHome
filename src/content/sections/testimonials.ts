import type { HomeTextsRecord, TestimonialRecord } from '@/content/records/schema';
import type { SectionHeadingContent } from '@/content/types';
import { Testimonial } from '@/domain';

/**
 * Contenido de la sección 11, los testimonios (`dc.html:330-343`; datos en el
 * array `T` del script, `dc.html:646-654`).
 *
 * El diseño arma la cinta con `testimoniosLoop: T.concat(T)` (`dc.html:715`).
 * Acá la lista va **una sola vez**: la copia la pone el organism `Marquee`,
 * que además la oculta a los lectores de pantalla.
 */
export type TestimonialsContent = SectionHeadingContent & {
  /** Nombre de la región para lectores de pantalla (el `aria-label` de la sección). */
  readonly ariaLabel: string;
  /** Separador entre autor, ciudad y viaje en el pie de cada testimonio. */
  readonly captionSeparator: string;
  /** Los testimonios, en el orden en que se cargaron. */
  readonly testimonials: readonly Testimonial[];
  /** Texto del botón que pausa la cinta (no está en el diseño: WCAG 2.2.2, CLAUDE.md §9). */
  readonly marqueePauseLabel: string;
  /** Texto del mismo botón con la cinta en pausa. */
  readonly marqueeResumeLabel: string;
};

/**
 * Textos y testimonios de "Lo que se traen de la montaña". Título y
 * testimonios se editan desde el panel; los iniciales son los del diseño.
 */
export function testimonialsContent(
  records: readonly TestimonialRecord[],
  texts: HomeTextsRecord['testimonials'],
): TestimonialsContent {
  return {
    ariaLabel: 'Testimonios',
    title: texts.title,
    captionSeparator: ' · ',
    marqueePauseLabel: 'Pausar testimonios',
    marqueeResumeLabel: 'Reanudar testimonios',
    testimonials: records.map(({ id: _id, ...params }) => new Testimonial(params)),
  };
}
