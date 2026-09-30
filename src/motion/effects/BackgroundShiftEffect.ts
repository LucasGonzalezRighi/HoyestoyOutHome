import { BACKGROUND_SHIFT } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES, MOTION_SELECTORS } from '../attributes';
import { queryAll } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import type { StyleWriter } from '../core/StyleWriter';

/**
 * Fondo de la página que cambia por sección (`dc.html:530-531`).
 *
 * Mientras una sección `[data-bg-shift]` pisa la franja central del viewport,
 * el fondo de `[data-bg-root]` toma su color (la transición la pone el CSS del
 * root). Si dos pisan la franja, gana la última del documento.
 */
export class BackgroundShiftEffect extends ScrollEffect {
  private root: HTMLElement | null = null;
  private sections: HTMLElement[] = [];
  private rects: DOMRect[] = [];

  constructor(private readonly styles: StyleWriter) {
    super();
  }

  override collect(doc: Document): void {
    this.root = doc.querySelector<HTMLElement>(MOTION_SELECTORS.backgroundRoot);
    this.sections = queryAll(doc, MOTION_SELECTORS.backgroundShift);
  }

  override measure(): void {
    this.rects = this.sections.map((section) => section.getBoundingClientRect());
  }

  override apply(frame: FrameState): void {
    if (!this.root) return;
    const { viewportHeight } = frame;
    let color = '';
    this.rects.forEach((rect, index) => {
      if (
        rect.top < viewportHeight * BACKGROUND_SHIFT.bandEnd &&
        rect.bottom > viewportHeight * BACKGROUND_SHIFT.bandStart
      ) {
        color = this.sections[index]?.getAttribute(MOTION_ATTRIBUTES.backgroundShift) ?? '';
      }
    });
    this.styles.set(this.root, 'backgroundColor', color || BACKGROUND_SHIFT.fallback);
  }
}
