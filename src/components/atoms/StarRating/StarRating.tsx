import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import styles from './StarRating.module.css';

const MIN_STARS = 1;
const MAX_STARS = 5;
/** Glifo, no texto: lo que se lee es `label`. */
const STAR_GLYPH = '★';

/** Props de `StarRating`. Acepta cualquier atributo de `<span>`. */
export type StarRatingProps = {
  /** Cantidad de estrellas, entero de 1 a 5. Fuera de rango se acota. */
  value: number;
  /** Lo que lee el lector de pantalla, ya redactado en `content/` (p. ej. "5 estrellas"). */
  label: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'children' | 'role' | 'aria-label'>;

/**
 * Calificación con estrellas ★ de los testimonios.
 *
 * Lleva `role="img"`: el diseño le pone `aria-label` a un `<span>` pelado, que
 * los lectores de pantalla no anuncian. Con el rol se lee el label y no cinco
 * veces "estrella negra".
 */
export function StarRating({ value, label, className, ...rest }: StarRatingProps) {
  const stars = Math.min(MAX_STARS, Math.max(MIN_STARS, Math.round(value)));

  return (
    <span role="img" aria-label={label} className={cn(styles.rating, className)} {...rest}>
      {STAR_GLYPH.repeat(stars)}
    </span>
  );
}
