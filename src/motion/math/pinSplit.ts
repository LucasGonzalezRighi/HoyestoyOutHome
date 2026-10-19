import { PIN_SPLIT } from '@/design-system/tokens/motion';

import { clamp01 } from './clamp';

/** Lo que el efecto mide de la secuencia en un frame. */
export type PinSplitMeasure = {
  /** `top` del envoltorio alto respecto del viewport. */
  readonly top: number;
  /** Alto del envoltorio (el recorrido fijo + una pantalla + el footer). */
  readonly height: number;
  readonly viewportHeight: number;
  /** Alto de lo que sube al final (el footer); 0 si no hay. */
  readonly exitHeight: number;
  /** `top` de lo que sube al final respecto del viewport. */
  readonly exitTop: number;
};

/** Las cuatro etapas de la secuencia, de 0 a 1 y ya suavizadas. */
export type PinSplitProgress = {
  /** La sección entra desde abajo hasta quedar fija. */
  readonly enter: number;
  /** La palabra gigante se parte y las mitades viajan a los costados. */
  readonly open: number;
  /** Aparece el contenido (título, canales y formulario). */
  readonly reveal: number;
  /** Lo que sigue (el footer) sube por encima y la tapa. */
  readonly exit: number;
  /** Si hay recorrido para fijarse (escritorio) o se abre al entrar (teléfono). */
  readonly pinned: boolean;
  /** Recorrido fijo en px (sin la pantalla ni el footer). */
  readonly travel: number;
};

/** Ida y vuelta suave (seno), como el contacto del portafolio. */
function sine(value: number): number {
  // Escrito así (y no `-(cos − 1) / 2`) para que en 0 dé 0 y no −0.
  return 0.5 - Math.cos(Math.PI * clamp01(value)) / 2;
}

/**
 * Etapas de la secuencia fija del Contacto según el scroll.
 *
 * Con recorrido de sobra (más de media pantalla), el avance **dentro** del
 * tramo fijo maneja la palabra y el contenido (`PIN_SPLIT`). Si no hay lugar
 * para fijarse, se abre a medida que la sección entra, y no hay salida.
 */
export function pinSplitProgress(m: PinSplitMeasure): PinSplitProgress {
  const vh = Math.max(1, m.viewportHeight);
  const travel = m.height - vh - m.exitHeight;
  const enter = clamp01((vh - m.top) / vh);
  if (travel > vh * 0.5) {
    const p = clamp01(-m.top / travel);
    const exitSpan = Math.max(1, Math.min(m.exitHeight, vh));
    return {
      enter: sine(enter),
      open: sine((p - PIN_SPLIT.openFrom) / PIN_SPLIT.openSpan),
      reveal: sine((p - PIN_SPLIT.revealFrom) / PIN_SPLIT.revealSpan),
      exit: m.exitHeight > 0 ? sine((vh - m.exitTop) / exitSpan) : 0,
      pinned: true,
      travel,
    };
  }
  const p = clamp01((vh * PIN_SPLIT.flowStart - m.top) / (vh * PIN_SPLIT.flowSpan));
  return {
    enter: sine(enter),
    open: sine(p),
    reveal: sine((p - PIN_SPLIT.flowRevealFrom) / PIN_SPLIT.flowRevealSpan),
    exit: 0,
    pinned: false,
    travel: 0,
  };
}
