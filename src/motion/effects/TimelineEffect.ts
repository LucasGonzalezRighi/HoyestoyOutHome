import { TIMELINE } from '@/design-system/tokens/motion';

import { MOTION_SELECTORS } from '../attributes';
import { queryAll } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import { clamp01 } from '../math/clamp';

/**
 * Relleno de la línea de tiempo del cronograma (`[data-timeline]`, `dc.html:550`).
 *
 * Se mide el **padre** (el riel completo) y el relleno se escala en Y hasta la
 * línea del 60% del viewport: la línea "acompaña" la lectura día por día.
 * Corre aunque el movimiento esté apagado, como en el diseño: es un indicador,
 * no un adorno.
 */
export class TimelineEffect extends ScrollEffect {
  private fills: HTMLElement[] = [];
  private rails: (DOMRect | null)[] = [];

  override collect(doc: Document): void {
    this.fills = queryAll(doc, MOTION_SELECTORS.timeline);
  }

  override measure(): void {
    this.rails = this.fills.map((fill) => fill.parentElement?.getBoundingClientRect() ?? null);
  }

  override apply(frame: FrameState): void {
    this.fills.forEach((fill, index) => {
      const rail = this.rails[index];
      if (!rail) return;
      fill.style.transform = `scaleY(${clamp01((frame.viewportHeight * TIMELINE.fillLine - rail.top) / rail.height).toFixed(4)})`;
    });
  }
}
