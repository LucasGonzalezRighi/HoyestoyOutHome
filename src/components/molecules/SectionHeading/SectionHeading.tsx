import type { HTMLAttributes, ReactNode } from 'react';

import { Eyebrow } from '@/components/atoms/Eyebrow';
import { reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './SectionHeading.module.css';

/** Props de `SectionHeading`. El resto de los atributos va al contenedor. */
export type SectionHeadingProps = {
  /** Etiqueta en mayúsculas arriba del título. Opcional: algunas secciones no la tienen. */
  eyebrow?: string;
  /** El título. `ReactNode` para poder pintar un tramo en otro color ("**Calle &** Stepanek"). */
  title: ReactNode;
  /** Nivel del título. Por defecto `h2`. */
  as?: 'h2' | 'h3';
  className?: string;
  eyebrowClassName?: string;
  /** El tamaño y el margen de abajo del título los pone quien lo usa: cambian en cada sección. */
  titleClassName?: string;
  /**
   * Coreografía de entrada del diseño: el eyebrow entra desde la izquierda y
   * el título sube un escalón después. Sin eyebrow, el título sube sin
   * retraso ("Lo que se traen de la montaña", "Postales del camino").
   * Por defecto `true`.
   */
  reveal?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children' | 'title'>;

/**
 * Encabezado de sección: eyebrow + título, con la entrada que el diseño
 * repite en casi todas las secciones (`reveal('left')` y
 * `reveal('up', { delay: 1 })`).
 *
 * No decide tamaños: el diseño usa un tamaño de título distinto en cada
 * sección (`min(48px, 3.3vw)`, `clamp(38px, 4.6vw, 64px)`…), así que ese
 * valor vive en el módulo del feature y entra por `titleClassName`.
 */
export function SectionHeading({
  eyebrow,
  title,
  as: Title = 'h2',
  className,
  eyebrowClassName,
  titleClassName,
  reveal: shouldReveal = true,
  ...rest
}: SectionHeadingProps) {
  return (
    <div className={className} {...rest}>
      {eyebrow ? (
        <Eyebrow className={eyebrowClassName} {...(shouldReveal ? reveal('left') : {})}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Title
        className={cn(styles.title, titleClassName)}
        {...(shouldReveal ? reveal('up', eyebrow ? { delay: 1 } : {}) : {})}
      >
        {title}
      </Title>
    </div>
  );
}
