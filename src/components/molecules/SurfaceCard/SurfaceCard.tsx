import type { HTMLAttributes, ReactNode } from 'react';

import { tilt } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './SurfaceCard.module.css';

/** Fondo de la card. */
export type SurfaceCardTone =
  /** `--color-surface`: pilares de "Por qué" y paneles de servicios. */
  | 'surface'
  /** Dorado claro: "¿Puedo?". */
  | 'accent-100'
  /** Verde musgo claro: "¿Es para mí?". */
  | 'accent-2-100'
  /** Verde musgo oscuro con texto claro: stats de Lago Lolog. */
  | 'accent-2-800';

/** Radio de la card. */
export type SurfaceCardRadius =
  /** `--radius-lg` (28px): pilares y stats de Lolog. */
  | 'lg'
  /** `--radius-xl` (32px): "¿Puedo?" / "¿Es para mí?". */
  | 'xl';

const TONE_CLASSES: Record<SurfaceCardTone, string | undefined> = {
  surface: styles.toneSurface,
  'accent-100': styles.toneAccent100,
  'accent-2-100': styles.toneAccentTwo100,
  'accent-2-800': styles.toneAccentTwo800,
};

const RADIUS_CLASSES: Record<SurfaceCardRadius, string | undefined> = {
  lg: styles.radiusLg,
  xl: styles.radiusXl,
};

/** Props de `SurfaceCard`. El resto de los atributos va al envoltorio externo. */
export type SurfaceCardProps = {
  /** Por defecto `surface`. */
  tone?: SurfaceCardTone;
  /** Por defecto `lg`. */
  radius?: SurfaceCardRadius;
  /** Clase del envoltorio externo (el que se anima al entrar). */
  className?: string;
  /** Clase de la card en sí: padding y layout interno los pone quien la usa. */
  innerClassName?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;

/**
 * La card que se inclina siguiendo al cursor: pilares, "¿Puedo?",
 * "¿Es para mí?", paneles de servicios y stats de Lolog.
 *
 * Son dos capas porque las mueven dos efectos distintos del motor: el
 * envoltorio externo recibe la aparición (`reveal`, esparcida desde afuera) y
 * la card interna recibe la inclinación (`tilt`). Si fueran el mismo elemento,
 * los dos escribirían `transform` y se pisarían.
 */
export function SurfaceCard({
  tone = 'surface',
  radius = 'lg',
  className,
  innerClassName,
  children,
  ...rest
}: SurfaceCardProps) {
  return (
    <div className={className} {...rest}>
      <div
        {...tilt()}
        className={cn(styles.card, TONE_CLASSES[tone], RADIUS_CLASSES[radius], innerClassName)}
      >
        {children}
      </div>
    </div>
  );
}
