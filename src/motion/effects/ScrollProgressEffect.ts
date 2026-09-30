import { MOTION_SELECTORS } from '../attributes';
import { scrollingElementOf } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import { clamp01 } from '../math/clamp';

/**
 * Barra de progreso de lectura (`[data-scroll-progress]`): se escala en X de 0
 * a 1 a lo largo de toda la página (`dc.html:528-529`).
 */
export class ScrollProgressEffect extends ScrollEffect {
  private bar: HTMLElement | null = null;
  private scroller: Element | null = null;
  private progress = 0;

  override collect(doc: Document): void {
    this.bar = doc.querySelector<HTMLElement>(MOTION_SELECTORS.scrollProgress);
    this.scroller = scrollingElementOf(doc);
  }

  override measure(frame: FrameState): void {
    if (!this.bar || !this.scroller) return;
    this.progress = clamp01(
      frame.scrollY / Math.max(1, this.scroller.scrollHeight - frame.viewportHeight),
    );
  }

  override apply(): void {
    if (this.bar) this.bar.style.transform = `scaleX(${this.progress.toFixed(4)})`;
  }
}
