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
 * No lleva `scroll-margin-top`: que un salto por ancla (`#calle`) no deje el
 * principio de la sección debajo del nav sticky lo resuelve el
 * `scroll-padding-top` del `<html>` (`design-system/base.css`), que vale para
 * todas las anclas y para el foco. Un `scroll-margin` acá se le sumaría y el
 * salto quedaría corrido el doble.
 */
export function Section({ spacing = 'default', className, children, ...rest }: SectionProps) {
  return (
    <section className={cn(SPACING_CLASSES[spacing], className)} {...rest}>
      {children}
    </section>
  );
}
