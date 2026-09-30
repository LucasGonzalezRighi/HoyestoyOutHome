import type { HTMLAttributes } from 'react';

import { StarRating } from '@/components/atoms/StarRating';
import type { Testimonial } from '@/domain';
import { tilt } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './TestimonialCard.module.css';

/** Props de `TestimonialCard`. El resto de los atributos va al `<figure>`. */
export type TestimonialCardProps = {
  /** El testimonio: frase, puntaje, autor, ciudad y viaje. */
  testimonial: Testimonial;
  /** Lo que separa autor, ciudad y viaje en el pie (`' · '`), desde el contenido. */
  captionSeparator: string;
  /** Clase extra para el `<figure>`. */
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

/**
 * Un testimonio de la cinta (`dc.html:335-339`): estrellas, la frase entre
 * comillas y el pie con autor, ciudad y viaje.
 *
 * Es un `<figure>` con `<blockquote>` y `<figcaption>`, la forma estándar de
 * una cita con atribución. Se inclina siguiendo al cursor (`tilt()`), como en
 * el diseño.
 */
export function TestimonialCard({
  testimonial,
  captionSeparator,
  className,
  ...rest
}: TestimonialCardProps) {
  return (
    <figure className={cn(styles.card, className)} {...tilt()} {...rest}>
      <StarRating value={testimonial.rating} label={testimonial.ratingLabel()} />
      <blockquote className={styles.quote}>{testimonial.quotedText()}</blockquote>
      <figcaption className={styles.caption}>
        <strong>{testimonial.author}</strong>
        {captionSeparator}
        {testimonial.city}
        {captionSeparator}
        <span className={styles.trip}>{testimonial.tripName}</span>
      </figcaption>
    </figure>
  );
}
