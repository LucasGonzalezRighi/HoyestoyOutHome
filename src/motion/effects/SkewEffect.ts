import { SKEW } from '@/design-system/tokens/motion';

import { MOTION_SELECTORS } from '../attributes';
import { queryAll } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import type { PointerTracker } from '../core/PointerTracker';
import type { StyleWriter } from '../core/StyleWriter';

/**
 * Deformación por velocidad del scroll (`[data-skew]`, `dc.html:569`): las
 * cards de viajes se inclinan y giran apenas mientras el riel horizontal corre,
 * y se enderezan al frenar.
 *
 * Comparte el elemento con el tilt (los dos escriben `transform`), así que se
 * saltea la card que el tilt tiene inclinada. Se entera por el
 * `PointerTracker` compartido, no por una variable global.
 */
export class SkewEffect extends ScrollEffect {
  private elements: HTMLElement[] = [];

  constructor(
    private readonly styles: StyleWriter,
    private readonly pointer: PointerTracker,
  ) {
    super();
  }

  override collect(doc: Document): void {
    this.elements = queryAll(doc, MOTION_SELECTORS.skew);
  }

  override apply(frame: FrameState): void {
    if (frame.off) {
      // Por la caché y no directo como el original (`dc.html:558`): ver ParallaxEffect.
      for (const element of this.elements) this.styles.set(element, 'transform', '');
      return;
    }
    const { velocity, intensity: k } = frame;
    for (const element of this.elements) {
      if (element === this.pointer.tiltTarget) continue;
      this.styles.set(
        element,
        'transform',
        `skewX(${(-velocity * SKEW.skewDeg * k).toFixed(2)}deg) rotate(${(velocity * SKEW.rotateDeg * k).toFixed(2)}deg)`,
      );
    }
  }
}
