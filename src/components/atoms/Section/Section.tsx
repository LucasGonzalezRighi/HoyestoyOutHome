import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Section.module.css';

/** Aire arriba de la sección. El diseño solo separa por arriba: el de abajo lo pone la siguiente. */
export type SectionSpacing =
  /** `--section-space`: el de casi todas las secciones. */
  | 'default'
  /** `--section-space-compact`: "¿Puedo?" / "¿Es para mí?", que continúa a Calle & Stepanek. */
  | 'compact'
  /** Sin aire: la sección lo maneja sola (scroll horizontal, cierre). */
  | 'none';

const SPACING_CLASSES: Record<SectionSpacing, string | undefined> = {
  default: styles.spacingDefault,
  compact: styles.spacingCompact,
  none: undefined,
};

/** Props de `Section`. Acepta `id`, `aria-label`, `data-*` y cualquier atributo de `<section>`. */
export type SectionProps = {
  /** Por defecto `default`. */
  spacing?: SectionSpacing;
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

/**
 * Banda vertical de la landing: pone el ritmo vertical entre secciones.
 *
 * Lleva `scroll-margin-top` con el alto del nav: como el nav es sticky, sin
 * esto un salto por ancla (`#calle`) deja el principio de la sección debajo
 * de la barra.
 */
export function Section({ spacing = 'default', className, children, ...rest }: SectionProps) {
  return (
    <section className={cn(styles.section, SPACING_CLASSES[spacing], className)} {...rest}>
      {children}
    </section>
  );
}
