import type { ReactNode } from 'react';

import { reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './Timeline.module.css';
import type { TimelineHeadingLevel } from './Timeline.types';

/** Props de `TimelineGroup`. */
export type TimelineGroupProps = {
  /** Subtítulo del grupo: el mes en el calendario (`"Noviembre 2026"`). */
  title: ReactNode;
  /** Nivel del subtítulo. Un nivel más arriba que el de sus ítems. */
  headingLevel: TimelineHeadingLevel;
  /** Los ítems del grupo (`TimelineItem`). */
  children: ReactNode;
  className?: string;
};

/**
 * Grupo de ítems dentro de una `Timeline` (las salidas de un mes en el
 * calendario). Va directo adentro de `Timeline`, como cualquier ítem.
 *
 * Es un `<li>` de la lista de afuera con su subtítulo y una lista propia: el
 * lector de pantalla anuncia el mes y después cuántas salidas tiene. En
 * pantalla, el subtítulo lleva un punto verde musgo sobre el riel (el color
 * con el que arranca el relleno), así el mes marca un corte en la línea sin
 * competir con los círculos de cada ítem.
 */
export function TimelineGroup({ title, headingLevel, children, className }: TimelineGroupProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <li className={cn(styles.group, className)}>
      <Heading className={styles.groupTitle} {...reveal('up')}>
        {title}
      </Heading>
      <ol className={styles.list}>{children}</ol>
    </li>
  );
}
