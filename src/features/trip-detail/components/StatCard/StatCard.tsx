import { SurfaceCard } from '@/components/molecules/SurfaceCard';
import type { Metric } from '@/domain';
import { reveal } from '@/motion/attributes';

import styles from './StatCard.module.css';

/** Props de `StatCard`. */
export type StatCardProps = {
  /** El dato: valor con su prefijo y sufijo, y su bajada. */
  metric: Metric;
  /** Escalón de la entrada: la posición de la stat en la grilla (0, 1, 2, 3). */
  revealDelay: number;
};

/**
 * Una stat verde de la presentación del viaje (las de Lago Lolog en el
 * diseño, `dc.html:234-240`): el número con su prefijo y sufijo, y la bajada.
 *
 * Se renderiza como `<li>` porque las stats son una lista. Adentro,
 * `SurfaceCard` separa las dos animaciones: su envoltorio recibe la entrada
 * (`reveal('scale')`) y su card la inclinación (`tilt()`).
 *
 * El número va fijo, sin el contador del diseño que lo subía desde 0 al
 * scrollear (pedido del cliente, noviembre 2026): la distancia, los días, las
 * noches y la altura se leen enteros desde el primer momento.
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
        <p className={styles.value}>{metric.format()}</p>
        <p className={styles.label}>{metric.label}</p>
      </SurfaceCard>
    </li>
  );
}
