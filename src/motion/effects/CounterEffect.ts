import { COUNTER } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES, MOTION_SELECTORS } from '../attributes';
import { queryAll, readNumber } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import { clamp01 } from '../math/clamp';
import { formatCounter, parseCounterFormat } from '../math/counterFormat';
import { easeInOutCubic } from '../math/easing';

/**
 * Contadores (`[data-count]`, `dc.html:552-555`): suben de 0 a su valor
 * mientras cruzan la mitad inferior del viewport, y bajan si se scrollea para
 * atrás. Con el movimiento apagado muestran el valor final.
 *
 * El marcado trae el valor final como texto, así que sin JS se lee bien.
 */
export class CounterEffect extends ScrollEffect {
  private counters: HTMLElement[] = [];
  private tops: number[] = [];
  /** Último texto escrito por elemento (`el._txt` del original): no se toca el DOM si no cambió. */
  private readonly texts = new WeakMap<HTMLElement, string>();

  override collect(doc: Document): void {
    this.counters = queryAll(doc, MOTION_SELECTORS.count);
  }

  override measure(): void {
    this.tops = this.counters.map((counter) => counter.getBoundingClientRect().top);
  }

  override apply(frame: FrameState): void {
    const { viewportHeight } = frame;
    this.counters.forEach((counter, index) => {
      const top = this.tops[index];
      if (top === undefined) return;
      const progress = frame.off
        ? 1
        : easeInOutCubic(clamp01((viewportHeight - top) / (viewportHeight * COUNTER.span)));
      const text = formatCounter(
        readNumber(counter, MOTION_ATTRIBUTES.count),
        progress,
        parseCounterFormat(counter.getAttribute(MOTION_ATTRIBUTES.countFormat)),
      );
      if (this.texts.get(counter) === text) return;
      this.texts.set(counter, text);
      counter.textContent = text;
    });
  }
}
