import { STACK } from '@/design-system/tokens/motion';

import { MOTION_SELECTORS } from '../attributes';
import { isStylable, queryAll } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import type { StyleWriter } from '../core/StyleWriter';
import { clamp01 } from '../math/clamp';

/**
 * Cards apilables del itinerario (`[data-stack]`, `dc.html:542-548`).
 *
 * Cada envoltorio es sticky; cuando el siguiente se le sube encima, la card de
 * adentro (su primer hijo) se achica, gira apenas y se oscurece, como si
 * quedara abajo de la pila. La última del grupo nunca se transforma.
 */
export class StackEffect extends ScrollEffect {
  private wrappers: HTMLElement[] = [];
  private tops: number[] = [];

  constructor(private readonly styles: StyleWriter) {
    super();
  }

  override collect(doc: Document): void {
    this.wrappers = queryAll(doc, MOTION_SELECTORS.stack);
  }

  override measure(): void {
    this.tops = this.wrappers.map((wrapper) => wrapper.getBoundingClientRect().top);
  }

  override apply(frame: FrameState): void {
    const { viewportHeight, intensity: k } = frame;
    this.wrappers.forEach((wrapper, index) => {
      const card = wrapper.firstElementChild;
      if (!isStylable(card)) return;
      // La última card no tiene a nadie que se le suba encima.
      const nextTop = this.tops[index + 1];
      if (frame.off || nextTop === undefined) {
        this.styles.set(card, 'transform', '');
        this.styles.set(card, 'filter', '');
        return;
      }
      const covered = clamp01((viewportHeight - nextTop) / (viewportHeight - STACK.pinTopPx));
      this.styles.set(
        card,
        'transform',
        `scale(${(1 - STACK.shrink * covered * Math.min(k, STACK.shrinkMaxIntensity)).toFixed(4)}) rotate(${(-covered * STACK.rotateDeg * k).toFixed(2)}deg)`,
      );
      this.styles.set(
        card,
        'filter',
        covered > STACK.darkenThreshold
          ? `brightness(${(1 - STACK.darken * covered).toFixed(3)})`
          : '',
      );
    });
  }
}
