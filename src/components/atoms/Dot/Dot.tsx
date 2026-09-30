import type { HTMLAttributes } from 'react';

import { cn } from '@/utils/cn';

import styles from './Dot.module.css';

/** Diámetros del diseño, en px. */
export type DotSize =
  /** Listas de servicios. */
  | 7
  /** Listas de "¿Es para mí?". */
  | 8
  /** Separador de la cinta del hero. */
  | 12;

/** Colores del punto. */
export type DotTone =
  /** `--color-accent-500`: viñetas de listas, "¿Qué necesito?". */
  | 'accent'
  /** `--color-accent-2`: servicios incluidos y traslados. */
  | 'accent-2'
  /** `--color-neutral-500`: servicios NO incluidos. */
  | 'neutral'
  /** `--color-accent-400`: separador de la cinta del hero. */
  | 'accent-400';

const SIZE_CLASSES: Record<DotSize, string | undefined> = {
  7: styles.size7,
  8: styles.size8,
  12: styles.size12,
};

const TONE_CLASSES: Record<DotTone, string | undefined> = {
  accent: styles.accent,
  'accent-2': styles.accentTwo,
  neutral: styles.neutral,
  'accent-400': styles.accent400,
};

/** Props de `Dot`. Acepta cualquier atributo de `<span>`. */
export type DotProps = {
  /** Por defecto 8. */
  size?: DotSize;
  /** Por defecto `accent`. */
  tone?: DotTone;
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'children'>;

/**
 * Punto circular decorativo: viñeta de listas y separador de la cinta.
 *
 * Es decoración pura, así que va con `aria-hidden`: el lector de pantalla
 * lee la lista, no los puntos.
 */
export function Dot({ size = 8, tone = 'accent', className, ...rest }: DotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(styles.dot, SIZE_CLASSES[size], TONE_CLASSES[tone], className)}
      {...rest}
    />
  );
}
