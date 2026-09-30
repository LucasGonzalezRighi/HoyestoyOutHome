import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Eyebrow.module.css';

/** Props de `Eyebrow`. Acepta cualquier atributo de `<p>` (ahí van los `data-*` del reveal). */
export type EyebrowProps = {
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLParagraphElement>, 'className' | 'children'>;

/**
 * Etiqueta en mayúsculas que encabeza una sección ("Por qué viajar con
 * nosotros", "Mendoza", "Neuquén · Huella Andina").
 *
 * Va en verde musgo, la segunda voz de la marca, para que el título de abajo
 * sea lo único dorado/marrón del bloque. En el diseño entra con `reveal('left')`,
 * que se le esparce desde afuera (o lo pone `SectionHeading`).
 */
export function Eyebrow({ className, children, ...rest }: EyebrowProps) {
  return (
    <p className={cn(styles.eyebrow, className)} {...rest}>
      {children}
    </p>
  );
}
