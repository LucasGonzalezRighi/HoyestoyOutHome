import { MOTION_MEDIA } from '@/design-system/tokens/motion';

import type { PointerSnapshot } from './FrameState';

/**
 * Estado del puntero que comparten el motor y los efectos
 * (`mouse`, `mouseMoved` y `fine` del original, `dc.html:422-425`).
 *
 * Lo crea `createMotionEngine` y se inyecta al motor, que lo alimenta con cada
 * `pointermove` y lo congela en cada frame (`FrameState.pointer`). Nadie usa
 * variables globales.
 *
 * El `tiltEl` del original (la card inclinada) quedó adentro de `TiltEffect`:
 * solo lo compartía con el skew por velocidad, que se sacó por pedido del
 * cliente (octubre 2026).
 *
 * El `hot` del original (el mouse sobre un link o botón) no se portó: solo lo
 * usaba el anillo del cursor, que tampoco se portó (ver CLAUDE.md §9).
 */
export class PointerTracker {
  /** Hay un mouse de verdad. Se decide una vez, al montar, como en el diseño. */
  readonly fine: boolean;

  private x: number;
  private y: number;
  private moved = false;

  /** Arranca con el mouse en el centro del viewport: ahí aparece el cursor custom antes del primer movimiento. */
  constructor(view: Window) {
    this.x = view.innerWidth / 2;
    this.y = view.innerHeight / 2;
    this.fine = view.matchMedia(MOTION_MEDIA.finePointer).matches;
  }

  /** Registra un movimiento del mouse. Lo llama el motor en cada `pointermove`. */
  track(event: PointerEvent): void {
    this.moved = true;
    this.x = event.clientX;
    this.y = event.clientY;
  }

  /**
   * Congela el estado para un frame y **consume** el aviso de movimiento: el
   * frame siguiente ve `moved: false` salvo que el mouse se vuelva a mover.
   */
  snapshot(): PointerSnapshot {
    const snapshot = { x: this.x, y: this.y, moved: this.moved, fine: this.fine };
    this.moved = false;
    return snapshot;
  }
}
