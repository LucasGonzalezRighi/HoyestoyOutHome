import { Tag } from '@/components/atoms/Tag';
import type { CalleStepanekScheduleContent } from '@/content/sections/calle-stepanek';
import { reveal, timelineFill } from '@/motion/attributes';

import styles from './Schedule.module.css';

/** Props de `Schedule`. */
export type ScheduleProps = {
  /** Título, duración y los días (instancias de `ScheduleDay`). */
  content: CalleStepanekScheduleContent;
};

/**
 * Cronograma de Calle & Stepanek (`dc.html:161-177`): título, duración y una
 * línea de tiempo con un ítem por día.
 *
 * El riel es decorativo (`aria-hidden`) y se va llenando con el scroll
 * (`timelineFill()`: el motor mide el riel y escala el relleno hasta la línea
 * del 60% del viewport). Los días entran desde la derecha, un escalón después
 * del anterior.
 *
 * Los días son `<h4>`, como en el diseño (`dc.html:168`): cuelgan de
 * "Cronograma", que ya es un `<h3>`, así que el índice de encabezados queda
 * h2 Calle & Stepanek › h3 Cronograma › h4 cada día, sin saltar niveles.
 */
export function Schedule({ content }: ScheduleProps) {
  return (
    <>
      <h3 className={styles.title} {...reveal('up')}>
        {content.title}
      </h3>
      <p className={styles.subtitle} {...reveal('up', { delay: 1 })}>
        {content.subtitle}
      </p>
      {/* El riel no puede ir dentro del <ol> (solo admite <li>): por eso el envoltorio. */}
      <div className={styles.timeline}>
        <div aria-hidden="true" className={styles.rail}>
          <div className={styles.fill} {...timelineFill()} />
        </div>
        <ol className={styles.days}>
          {content.days.map((day, index) => (
            <li key={day.day} className={styles.day} {...reveal('right', { delay: index })}>
              <span className={styles.dayNumber}>{day.dayLabel()}</span>
              <h4 className={styles.dayTitle}>{day.title}</h4>
              <p className={styles.dayText}>{day.description}</p>
              {day.hasStats ? (
                <ul className={styles.stats}>
                  {day.statLabels().map((stat) => (
                    <li key={stat}>
                      <Tag variant="outline" className={styles.stat}>
                        {stat}
                      </Tag>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
