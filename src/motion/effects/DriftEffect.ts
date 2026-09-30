import { MOTION_ATTRIBUTES, MOTION_SELECTORS } from '../attributes';
import { queryAll, readNumber } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import type { StyleWriter } from '../core/StyleWriter';

/**
 * Desplazamiento horizontal proporcional al scroll de la página (`[data-drift]`,
 * `dc.html:568`): el texto calado "Out Of Home" del hero, que se corre hacia
 * un costado mientras se baja. No mide nada: depende solo de `scrollY`.
 */
export class DriftEffect extends ScrollEffect {
  private elements: HTMLElement[] = [];

  constructor(private readonly styles: StyleWriter) {
    super();
  }

  override collect(doc: Document): void {
    this.elements = queryAll(doc, MOTION_SELECTORS.drift);
  }

  override apply(frame: FrameState): void {
    if (frame.off) {
      for (const element of this.elements) element.style.transform = '';
      return;
    }
    for (const element of this.elements) {
      const factor = readNumber(element, MOTION_ATTRIBUTES.drift);
      this.styles.set(
        element,
        'transform',
        `translate3d(${(frame.scrollY * factor * frame.intensity).toFixed(1)}px, 0, 0)`,
      );
    }
  }
}
