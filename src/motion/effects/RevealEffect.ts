import { REVEAL, REVEAL_TRANSITION } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES, MOTION_SELECTORS } from '../attributes';
import { queryAll, readNumber } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import type { StyleWriter } from '../core/StyleWriter';
import { easeInOutCubic } from '../math/easing';
import {
  introRevealProgress,
  isFarFromViewport,
  scrollEntryProgress,
  scrollExitProgress,
} from '../math/revealProgress';
import { revealStyles, wordRevealTransform } from '../math/revealTransforms';

/**
 * Apariciones (`[data-reveal]`, `dc.html:571-597`).
 *
 * No son play-once: la pose sale de la posición del elemento en el viewport,
 * así que el scroll las maneja en los dos sentidos (entran por abajo, salen
 * por arriba, y vuelven si se scrollea para atrás). La transición inline
 * (`REVEAL_TRANSITION`) suaviza el paso entre frames.
 *
 * Tres casos:
 * - `word` (titular del hero): lo maneja solo la intro del telón.
 * - con `intro`: la entrada la maneja la intro y nunca salen.
 * - el resto: entrada y salida atadas al scroll, con la coreografía de
 *   `revealTransforms.ts`.
 */
export class RevealEffect extends ScrollEffect {
  private elements: HTMLElement[] = [];
  private rects: DOMRect[] = [];
  /** Reveals que ya recibieron su pose al menos una vez (`el._rvDone`). */
  private readonly posed = new WeakSet<HTMLElement>();

  constructor(private readonly styles: StyleWriter) {
    super();
  }

  /**
   * Le pone la transición a cada reveal que no traiga una inline. Una
   * transición de la clase CSS no cuenta: la inline la pisa, como en el diseño.
   */
  override collect(doc: Document): void {
    this.elements = queryAll(doc, MOTION_SELECTORS.reveal);
    for (const element of this.elements) {
      if (!element.style.transition) element.style.transition = REVEAL_TRANSITION;
    }
  }

  override measure(frame: FrameState): void {
    this.rects = frame.off ? [] : this.elements.map((element) => element.getBoundingClientRect());
  }

  override apply(frame: FrameState): void {
    if (frame.off) {
      for (const element of this.elements) this.clear(element);
      return;
    }
    this.elements.forEach((element, index) => {
      const rect = this.rects[index];
      if (rect) this.pose(element, rect, frame);
    });
  }

  /** Movimiento apagado: el elemento queda en su lugar, visible y sin recorte. */
  private clear(element: HTMLElement): void {
    this.styles.set(element, 'opacity', '');
    this.styles.set(element, 'transform', '');
    this.styles.set(element, 'clipPath', '');
  }

  private pose(element: HTMLElement, rect: DOMRect, frame: FrameState): void {
    const { viewportHeight, intro } = frame;
    // Lejos del viewport y ya posado: su pose no cambió, no se reescribe.
    if (isFarFromViewport(rect, viewportHeight) && this.posed.has(element)) return;

    const delay = readNumber(element, MOTION_ATTRIBUTES.revealDelay) || 0;
    const span = readNumber(element, MOTION_ATTRIBUTES.revealSpan) || REVEAL.defaultSpan;
    const variant = element.getAttribute(MOTION_ATTRIBUTES.reveal);

    if (variant === 'word') {
      this.styles.set(element, 'transform', wordRevealTransform(intro, delay));
      this.posed.add(element);
      return;
    }

    const drivenByIntro = element.hasAttribute(MOTION_ATTRIBUTES.revealIntro);
    const entry = drivenByIntro
      ? introRevealProgress(intro, delay)
      : scrollEntryProgress(rect.top, viewportHeight, delay, span);
    const exit = drivenByIntro ? 1 : scrollExitProgress(rect.bottom, viewportHeight);

    const styles = revealStyles(
      variant,
      easeInOutCubic(entry),
      easeInOutCubic(exit),
      frame.intensity,
    );
    if (styles.clipPath !== undefined) this.styles.set(element, 'clipPath', styles.clipPath);
    this.styles.set(element, 'transform', styles.transform);
    this.styles.set(element, 'opacity', styles.opacity);
    this.posed.add(element);
  }
}
