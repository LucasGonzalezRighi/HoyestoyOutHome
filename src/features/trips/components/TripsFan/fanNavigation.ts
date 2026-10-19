/**
 * La lógica pura del abanico de "Próximos viajes": a qué panel pasa cada
 * flecha, cómo se escribe el contador y cuánto hay que correr la fila cuando
 * el panel que se abre quedó fuera de la vista. Sin DOM ni React: `TripsFan`
 * mide y aplica, acá solo se calcula (y se testea).
 */

/** Hacia dónde mueve una flecha: `-1` al viaje anterior, `1` al siguiente. */
export type FanDirection = -1 | 1;

/**
 * Índice del panel al que pasa una flecha. Da la vuelta en los extremos: del
 * último se pasa al primero y del primero al último. Así las flechas nunca
 * quedan deshabilitadas, y como todos los paneles están a la vista se ve a
 * dónde fue.
 *
 * @param current   Índice del panel abierto.
 * @param direction Flecha apretada.
 * @param count     Cantidad de paneles. Con 0 no hay a dónde ir: devuelve 0.
 */
export function stepIndex(current: number, direction: FanDirection, count: number): number {
  if (count <= 0) return 0;
  return (((current + direction) % count) + count) % count;
}

/** Dígitos mínimos del contador: "01", no "1". */
const COUNTER_MIN_DIGITS = 2;

/**
 * Un número del contador ("01 / 04"): la posición, contada desde 1, con cero
 * a la izquierda. Con cien viajes o más se escribe con los dígitos que tenga.
 *
 * @param position Posición contada desde 1 (el índice + 1, o el total).
 */
export function formatCounter(position: number): string {
  return String(position).padStart(COUNTER_MIN_DIGITS, '0');
}

/** Tramo de la fila que ocupa un panel, en px desde el comienzo del contenido de la fila. */
export type PanelSpan = {
  /** Dónde empieza. */
  readonly start: number;
  /** Cuánto mide. */
  readonly size: number;
};

/** Lo que se ve de la fila: desde dónde está scrolleada y cuánto entra. */
export type FanViewport = {
  /** `scrollLeft` de la fila. */
  readonly scrollLeft: number;
  /** Ancho visible de la fila (`clientWidth`). */
  readonly size: number;
};

/**
 * Dónde va a quedar el panel `index` cuando el abanico termine de moverse.
 *
 * Se calcula y no se mide porque al apretar una flecha los anchos están a
 * mitad de transición. En reposo todos los paneles miden `closedSize` menos el
 * abierto, así que el que se abre empieza después de `index` paneles cerrados
 * (cada uno con su `gap`).
 */
export function settledSpan(
  index: number,
  sizes: { closedSize: number; openSize: number; gap: number },
): PanelSpan {
  return { start: index * (sizes.closedSize + sizes.gap), size: sizes.openSize };
}

/**
 * `scrollLeft` que deja el panel entero a la vista moviendo la fila lo menos
 * posible, o `null` si ya se ve entero.
 *
 * Solo hace falta cuando la fila scrollea: con tantos viajes que los paneles
 * llegaron a su ancho mínimo y ya no entran. Si el panel es más ancho que lo
 * que se ve, se alinea su comienzo (que es donde está el texto).
 */
export function scrollLeftToReveal(panel: PanelSpan, viewport: FanViewport): number | null {
  const panelEnd = panel.start + panel.size;
  const viewEnd = viewport.scrollLeft + viewport.size;
  if (panel.start >= viewport.scrollLeft && panelEnd <= viewEnd) return null;
  if (panel.start < viewport.scrollLeft || panel.size > viewport.size) return panel.start;
  return panelEnd - viewport.size;
}
