import { SCROLL } from '@/design-system/tokens/motion';

import { clamp } from '../math/clamp';

/** Lectura del scroll en un frame. */
export type ScrollSample = {
  /** Scroll vertical (px). */
  readonly scrollY: number;
  /** Velocidad suavizada en px/frame, con zona muerta y tope (ver `SCROLL`). */
  readonly velocity: number;
};

/**
 * Posición y velocidad del scroll (`dc.html:477-479`).
 *
 * La velocidad cruda salta de un frame a otro (la rueda del mouse scrollea de
 * a golpes); suavizada, sirve para deformar cintas y cards sin que tiemblen.
 * Se lee una vez por frame desde el motor.
 */
export class ScrollTracker {
  /**
   * Arranca en 0 como el original: si la página carga ya scrolleada, el
   * primer frame registra un pico de velocidad (topeado) que se disipa solo.
   */
  private lastY = 0;
  /** Velocidad suavizada sin topear: el tope se aplica a la salida, no al estado. */
  private smoothed = 0;

  /** Lee el scroll de `scroller` y avanza el suavizado un frame. */
  sample(scroller: Element): ScrollSample {
    const scrollY = scroller.scrollTop;
    this.smoothed += (scrollY - this.lastY - this.smoothed) * SCROLL.smoothing;
    this.lastY = scrollY;
    const velocity =
      Math.abs(this.smoothed) < SCROLL.deadZone
        ? 0
        : clamp(this.smoothed, -SCROLL.maxVelocity, SCROLL.maxVelocity);
    return { scrollY, velocity };
  }
}
