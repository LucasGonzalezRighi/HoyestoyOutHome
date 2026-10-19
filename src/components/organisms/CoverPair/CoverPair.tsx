import type { ReactNode } from 'react';

import { coverPair } from '@/motion/attributes';

import styles from './CoverPair.module.css';

/** Props de `CoverPair`: las dos secciones, en el orden en que se leen. */
export type CoverPairProps = {
  /** La sección que queda fija en pantalla. */
  pinned: ReactNode;
  /** La sección que sube por encima y la tapa. */
  sheet: ReactNode;
};

/**
 * Cortina entre dos secciones (pedido del cliente, octubre 2026; el diseño no
 * la tiene): al scrollear, `pinned` se queda quieta y `sheet` sube como una
 * hoja, con las esquinas redondeadas y una sombra, y la tapa. Mientras la
 * tapa, la fija se achica y se apaga un poco (lo hace el motor,
 * `CoverPairEffect`).
 *
 * El envoltorio también acota el `sticky`: la sección fija se suelta cuando
 * termina la hoja, así no queda pegada detrás del resto de la página.
 *
 * La hoja es blanca y lisa (pedido del cliente): opaca para tapar a la fija y
 * sin las curvas de nivel, así se despega del fondo general de la página.
 *
 * Sin JS no hay cortina: las dos secciones van una abajo de la otra.
 */
export function CoverPair({ pinned, sheet }: CoverPairProps) {
  return (
    <div className={styles.pair} {...coverPair()}>
      <div className={styles.pinned}>{pinned}</div>
      <div className={styles.sheet}>
        {sheet}
      </div>
    </div>
  );
}
