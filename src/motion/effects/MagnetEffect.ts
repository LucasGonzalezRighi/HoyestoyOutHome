import { MAGNET, MAGNET_TRANSITION } from '@/design-system/tokens/motion';

import { MOTION_SELECTORS } from '../attributes';
import { queryAll } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { FrameEffect } from '../core/MotionEffect';
import type { StyleWriter } from '../core/StyleWriter';

/**
 * Botones magnéticos (`[data-magnet]`, `dc.html:503-511`): a menos de 110px
 * del cursor, el botón se deja arrastrar hacia él y crece apenas.
 *
 * Corre en cada frame pero **solo si el mouse se movió**: es el único efecto
 * de esa fase que lee layout, y así la página quieta no mide nada. Dentro del
 * frame respeta la misma regla que el resto: primero mide todos, después
 * escribe todos.
 */
export class MagnetEffect extends FrameEffect {
  private buttons: HTMLElement[] = [];

  constructor(private readonly styles: StyleWriter) {
    super();
  }

  /** Pone la transición con rebote en cada re-escaneo (pisa la del CSS a propósito, como el original). */
  override collect(doc: Document): void {
    this.buttons = queryAll(doc, MOTION_SELECTORS.magnet);
    for (const button of this.buttons) button.style.transition = MAGNET_TRANSITION;
  }

  override tick(frame: FrameState): void {
    if (!frame.pointer.moved) return;
    const { pointer, intensity: k } = frame;
    const rects = this.buttons.map((button) => button.getBoundingClientRect());
    this.buttons.forEach((button, index) => {
      const rect = rects[index];
      if (!rect) return;
      const dx = pointer.x - (rect.left + rect.width / 2);
      const dy = pointer.y - (rect.top + rect.height / 2);
      this.styles.set(
        button,
        'transform',
        !frame.off && Math.hypot(dx, dy) < MAGNET.radius
          ? `translate3d(${(dx * MAGNET.strength * k).toFixed(1)}px, ${(dy * MAGNET.strength * k).toFixed(1)}px, 0) scale(${MAGNET.scale})`
          : '',
      );
    });
  }
}
