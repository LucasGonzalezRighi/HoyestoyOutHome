import type { LiHTMLAttributes, ReactNode } from 'react';

import { VisuallyHidden } from '@/components/atoms/VisuallyHidden';
import { reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './Timeline.module.css';
import type { TimelineHeadingLevel, TimelineMarker } from './Timeline.types';

/** Props de `TimelineItem`. El resto de los atributos va al `<li>` (p. ej. `id`). */
export type TimelineItemProps = {
  /** Lo que va en el círculo: `"1"` o `{ value: '13', caption: 'nov', label: '13 de noviembre', dateTime: '2026-11-13' }`. */
  marker: TimelineMarker;
  /** Título del ítem: el tramo del día, el nombre del viaje. */
  title: ReactNode;
  /** Nivel del título (ver `TimelineHeadingLevel`). */
  headingLevel: TimelineHeadingLevel;
  /**
   * Escalón del reveal (0, 1, 2…): cada ítem entra un poco después que el
   * anterior. En el diseño es el índice del día (`data-rv-d="{{ $index }}"`,
   * `dc.html:166`). Por defecto 0.
   */
  delay?: number;
  /**
   * El cuerpo del ítem, debajo del título: párrafos (`TimelineText`), tags
   * (`TimelineTags`), la foto (`TimelinePhoto`), un link…
   */
  children?: ReactNode;
  className?: string;
} & Omit<LiHTMLAttributes<HTMLLIElement>, 'title' | 'children' | 'className'>;

/**
 * Un ítem de la `Timeline` (`dc.html:166-175`): un círculo montado sobre el
 * riel, el título y, debajo, lo que se le pase como hijos. Entra desde la
 * derecha, un escalón después del anterior.
 *
 * El círculo va antes del título en el DOM, como en el diseño: el lector de
 * pantalla lee "1, Llegada a Mendoza" o "13 de noviembre, Calle & Stepanek".
 */
export function TimelineItem({
  marker,
  title,
  headingLevel,
  delay = 0,
  children,
  className,
  ...rest
}: TimelineItemProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <li className={cn(styles.item, className)} {...rest} {...reveal('right', { delay })}>
      <Marker marker={marker} />
      <Heading className={styles.title}>{title}</Heading>
      {children}
    </li>
  );
}

/**
 * El círculo. Un texto suelto se renderiza como en el cronograma del diseño;
 * un `TimelineMarkerDetail` apila valor y bajada en dos renglones y, si trae
 * `label`, esconde lo visible del lector de pantalla y le da el texto entero.
 */
function Marker({ marker }: { marker: TimelineMarker }) {
  if (typeof marker === 'string') return <span className={styles.marker}>{marker}</span>;

  const { value, caption, label, dateTime } = marker;
  const face = (
    <span className={styles.markerFace} aria-hidden={label ? true : undefined}>
      <span className={styles.markerValue}>{value}</span>
      {caption ? <span className={styles.markerCaption}>{caption}</span> : null}
    </span>
  );
  const content = (
    <>
      {face}
      {label ? <VisuallyHidden>{label}</VisuallyHidden> : null}
    </>
  );
  const className = cn(styles.marker, caption ? styles.markerStacked : false);

  return dateTime ? (
    <time className={className} dateTime={dateTime}>
      {content}
    </time>
  ) : (
    <span className={className}>{content}</span>
  );
}
