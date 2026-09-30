import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Tag.module.css';

/** Tintes del `.tag` del design system, cada uno de su rampa. */
export type TagVariant =
  /** Dorado claro — "4 días, 3 noches", desnivel del itinerario. */
  | 'accent'
  /** Verde musgo claro — dificultad, cumbre, distancia del itinerario. */
  | 'accent-2'
  /** Neutro — duración de los viajes, handles del equipo. */
  | 'neutral'
  /** Contorno dorado — distancia de los viajes, stats del cronograma. */
  | 'outline';

const VARIANT_CLASSES: Record<TagVariant, string | undefined> = {
  accent: styles.accent,
  'accent-2': styles.accentTwo,
  neutral: styles.neutral,
  outline: styles.outline,
};

/** Props de `Tag`. Acepta cualquier atributo de `<span>`. */
export type TagProps = {
  /** Por defecto `neutral`. */
  variant?: TagVariant;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, 'className' | 'children'>;

/** Etiqueta chica en pastilla (`.tag` del design system): datos cortos de un viaje o una etapa. */
export function Tag({ variant = 'neutral', className, children, ...rest }: TagProps) {
  return (
    <span className={cn(styles.tag, VARIANT_CLASSES[variant], className)} {...rest}>
      {children}
    </span>
  );
}
