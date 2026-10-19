import type { ReactNode } from 'react';

import { Eyebrow } from '@/components/atoms/Eyebrow';
import { reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './DetailHeading.module.css';

/** Props de `DetailHeading`. */
export type DetailHeadingProps = {
  /** `id` del `<h2>`: la sección lo usa para nombrarse (`aria-labelledby`). */
  id: string;
  /** Rótulo en mayúsculas arriba del título. Opcional. */
  eyebrow?: string;
  /** El título (`<h2>`). */
  title: ReactNode;
  /** Bajada en itálica debajo del título ("4 días, 3 noches"). Opcional. */
  subtitle?: string;
  /** Clase extra del envoltorio (el aire de abajo, si cambia). */
  className?: string;
};

/**
 * Encabezado de un bloque de la página de viaje: eyebrow opcional, `<h2>` con
 * `id` y bajada opcional, entrando escalonados con el scroll.
 *
 * Existe porque `SectionHeading` no le pone `id` al título, y cada bloque de
 * la página toma su nombre accesible del `<h2>` (`aria-labelledby`).
 */
export function DetailHeading({ id, eyebrow, title, subtitle, className }: DetailHeadingProps) {
  const titleDelay = eyebrow ? 1 : 0;

  return (
    <div className={cn(styles.heading, className)}>
      {eyebrow ? <Eyebrow {...reveal('left')}>{eyebrow}</Eyebrow> : null}
      <h2 id={id} className={styles.title} {...reveal('up', { delay: titleDelay })}>
        {title}
      </h2>
      {subtitle ? (
        <p className={styles.subtitle} {...reveal('up', { delay: titleDelay + 1 })}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
