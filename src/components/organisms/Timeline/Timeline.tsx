import type { OlHTMLAttributes, ReactNode } from 'react';

import { timelineFill } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './Timeline.module.css';

/** Props de `Timeline`. El resto de los atributos va al `<ol>` (p. ej. `aria-labelledby`). */
export type TimelineProps = {
  /** Los ítems (`TimelineItem`) o los grupos (`TimelineGroup`). Nada más: el `<ol>` solo admite `<li>`. */
  children: ReactNode;
  /** Clase del envoltorio (márgenes, ancho máximo). */
  className?: string;
} & Omit<OlHTMLAttributes<HTMLOListElement>, 'className' | 'children'>;

/**
 * Línea de tiempo vertical: el cronograma de Calle & Stepanek del diseño
 * (`dc.html:163-176`), sacado a un organism para que lo usen el itinerario de
 * cada página de viaje y el calendario del home.
 *
 * Es una lista ordenada con un riel a la izquierda. El riel es decorativo
 * (`aria-hidden`) y se va llenando con el scroll (`timelineFill()`: el motor
 * mide el riel y escala el relleno hasta la línea del 60% del viewport, así la
 * línea acompaña la lectura). Corre aunque el movimiento esté apagado: es un
 * indicador, no un adorno.
 *
 * Adentro van `TimelineItem` (un círculo sobre el riel, un título y lo que se
 * le pase como hijos) o, para agrupar, `TimelineGroup` (un subtítulo con un
 * punto sobre el riel y sus propios ítems). Hay un solo riel para toda la
 * línea, con o sin grupos.
 *
 * Presentacional: recibe strings y nodos; no conoce el dominio ni el contenido.
 */
export function Timeline({ children, className, ...rest }: TimelineProps) {
  return (
    // El riel no puede ir dentro del <ol> (solo admite <li>): por eso el envoltorio.
    <div className={cn(styles.timeline, className)}>
      <div aria-hidden="true" className={styles.rail}>
        <div className={styles.fill} {...timelineFill()} />
      </div>
      <ol className={styles.list} {...rest}>
        {children}
      </ol>
    </div>
  );
}
