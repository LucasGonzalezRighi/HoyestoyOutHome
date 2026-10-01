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
 *
 * **Sin apilar** (no está en el original, CLAUDE.md §9): en mobile y en
 * pantallas bajas el CSS saca a los envoltorios del sticky, porque la card mide
 * más que la pantalla y la siguiente le tapaba el pie. Una card cuyo
 * envoltorio no está fijado queda en su pose natural: si no, se achicaría y
 * oscurecería mientras la siguiente sube, sin que haya pila. Se le pregunta al
 * CSS (`position` computado) y no a un breakpoint repetido acá.
 */
export class StackEffect extends ScrollEffect {
  private wrappers: HTMLElement[] = [];
  private tops: number[] = [];
  /** Si cada envoltorio está fijado (`position: sticky`), en paralelo con `wrappers`. */
  private pinned: boolean[] = [];
  /** El `window` del documento escaneado, para leer el `position` computado. */
  private view: Window | null = null;

  constructor(private readonly styles: StyleWriter) {
    super();
  }

  override collect(doc: Document): void {
    this.view = doc.defaultView;
    this.wrappers = queryAll(doc, MOTION_SELECTORS.stack);
  }

  override measure(): void {
    const view = this.view;
    this.tops = this.wrappers.map((wrapper) => wrapper.getBoundingClientRect().top);
    this.pinned = this.wrappers.map(
      (wrapper) => view !== null && view.getComputedStyle(wrapper).position === 'sticky',
    );
  }

  override apply(frame: FrameState): void {
    const { viewportHeight, intensity: k } = frame;
    this.wrappers.forEach((wrapper, index) => {
      const card = wrapper.firstElementChild;
      if (!isStylable(card)) return;
      // La última card no tiene a nadie que se le suba encima, y una que no
      // está fijada no queda abajo de ninguna.
      const nextTop = this.tops[index + 1];
      if (frame.off || nextTop === undefined || this.pinned[index] !== true) {
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
