import { SurfaceCard } from '@/components/molecules/SurfaceCard';
import type { Metric } from '@/domain';
import { counter, reveal } from '@/motion/attributes';

import styles from './StatCard.module.css';

/** Props de `StatCard`. */
export type StatCardProps = {
  /** El dato: valor final del contador, prefijo y sufijo, y su bajada. */
  metric: Metric;
  /** Escalón de la entrada: la posición de la stat en la grilla (0, 1, 2, 3). */
  revealDelay: number;
};

/**
 * Una stat verde de Lago Lolog (`dc.html:234-240`): el número con su prefijo
 * y sufijo, y la bajada abajo.
 *
 * Se renderiza como `<li>` porque las cuatro stats son una lista. Adentro,
 * `SurfaceCard` separa las dos animaciones: su envoltorio recibe la entrada
 * (`reveal('scale')`) y su card la inclinación (`tilt()`).
 *
 * Solo el número es el contador: prefijo y sufijo quedan quietos alrededor
 * mientras sube. El HTML trae el valor final (`formattedValue()`), así que sin
 * JS (o con el movimiento apagado) se lee el número correcto.
 */
export function StatCard({ metric, revealDelay }: StatCardProps) {
  return (
    <li>
      <SurfaceCard
        tone="accent-2-800"
        radius="lg"
        className={styles.wrapper}
        innerClassName={styles.card}
        {...reveal('scale', { delay: revealDelay })}
      >
        <p className={styles.value}>
          {metric.prefix}
          <span {...counter(metric.value)}>{metric.formattedValue()}</span>
          {metric.suffix}
        </p>
        <p className={styles.label}>{metric.label}</p>
      </SurfaceCard>
    </li>
  );
}
