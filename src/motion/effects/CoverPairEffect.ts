import { COVER } from '@/design-system/tokens/motion';

import { MOTION_SELECTORS } from '../attributes';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import type { StyleWriter } from '../core/StyleWriter';
import { coverProgress, coverStickyTop } from '../math/cover';

/** Custom property con el `top` del `sticky` de la sección fija. */
const COVER_TOP_PROPERTY = '--cover-top';

/** Un par cortina: la sección que queda fija y la que sube a taparla. */
type CoverPair = {
  readonly pinned: HTMLElement;
  readonly sheet: HTMLElement;
  top: number;
  progress: number;
  writtenTop: string | null;
};

/**
 * Cortinas entre secciones (`[data-cover-pair]`, pedido del cliente, octubre
 * 2026; el diseño no las tiene).
 *
 * En cada par, la primera hija queda fija con `position: sticky` (lo pone el
 * CSS del organism `CoverPair`) y la segunda, opaca, sube por encima y la tapa.
 * El motor hace las dos cosas que CSS no puede:
 *
 * - **Dónde se fija** (`--cover-top`): una sección más alta que la pantalla
 *   se fija recién cuando se vio entera (`coverStickyTop`). Solo cambia con el
 *   alto de la pantalla o de la sección.
 * - **El gesto**: mientras la de abajo la tapa (`coverProgress`), la fija se
 *   achica y se apaga hasta `COVER`, como si se alejara. Con el movimiento
 *   apagado no se mueve: solo queda el `sticky`.
 */
export class CoverPairEffect extends ScrollEffect {
  private pairs: CoverPair[] = [];

  constructor(private readonly styles: StyleWriter) {
    super();
  }

  override collect(doc: Document): void {
    this.reset();
    for (const pair of doc.querySelectorAll<HTMLElement>(MOTION_SELECTORS.coverPair)) {
      const pinned = pair.firstElementChild;
      const sheet = pair.lastElementChild;
      if (!(pinned instanceof HTMLElement) || !(sheet instanceof HTMLElement)) continue;
      if (pinned === sheet) continue;
      this.pairs.push({ pinned, sheet, top: 0, progress: 0, writtenTop: null });
    }
  }

  override measure(frame: FrameState): void {
    for (const pair of this.pairs) {
      pair.top = coverStickyTop(frame.viewportHeight, pair.pinned.offsetHeight);
      pair.progress = coverProgress(pair.sheet.getBoundingClientRect().top, frame.viewportHeight);
    }
  }

  override apply(frame: FrameState): void {
    for (const pair of this.pairs) {
      const top = `${Math.round(pair.top)}px`;
      if (top !== pair.writtenTop) {
        pair.pinned.style.setProperty(COVER_TOP_PROPERTY, top);
        pair.writtenTop = top;
      }
      const progress = frame.off ? 0 : pair.progress;
      this.styles.set(
        pair.pinned,
        'transform',
        progress > 0 ? `scale(${(1 - COVER.scale * progress).toFixed(4)})` : '',
      );
      this.styles.set(
        pair.pinned,
        'opacity',
        progress > 0 ? (1 - COVER.fade * progress).toFixed(3) : '',
      );
    }
  }

  override dispose(): void {
    this.reset();
  }

  /** Devuelve cada sección fija a su estado sin motor. */
  private reset(): void {
    for (const pair of this.pairs) {
      pair.pinned.style.removeProperty(COVER_TOP_PROPERTY);
      this.styles.set(pair.pinned, 'transform', '');
      this.styles.set(pair.pinned, 'opacity', '');
    }
    this.pairs = [];
  }
}
