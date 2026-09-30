import { MARQUEE } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES, MOTION_SELECTORS } from '../attributes';
import { queryAll, readNumber } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { FrameEffect } from '../core/MotionEffect';

/**
 * Cintas infinitas (`[data-marquee]`, `dc.html:495-501`).
 *
 * El riel trae su contenido duplicado; el efecto lo corre hacia la izquierda
 * (o la derecha con dirección -1) y, al completar medio ancho, lo vuelve a
 * empezar: como las dos mitades son iguales, el salto no se ve. El scroll la
 * acelera y la inclina según su velocidad; con el mouse encima se frena.
 *
 * Corre en cada frame (el loop no depende del scroll), pero su reseteo con el
 * movimiento apagado va en la fase de escritura, en el mismo lugar que el
 * original (junto al parallax, el drift y el skew).
 */
export class MarqueeEffect extends FrameEffect {
  private tracks: HTMLElement[] = [];
  /** Medio ancho de cada riel (`el._half`): el punto en que la cinta vuelve a empezar. */
  private readonly halves = new WeakMap<HTMLElement, number>();
  /** Desplazamiento actual de cada riel (`el._x`). Sobrevive a los re-escaneos. */
  private readonly offsets = new WeakMap<HTMLElement, number>();

  override collect(doc: Document): void {
    this.tracks = queryAll(doc, MOTION_SELECTORS.marquee);
    for (const track of this.tracks) this.halves.set(track, track.scrollWidth / 2);
  }

  override tick(frame: FrameState): void {
    if (frame.off) return;
    const { velocity, intensity: k } = frame;
    for (const track of this.tracks) {
      const direction = readNumber(track, MOTION_ATTRIBUTES.marquee) || 1;
      const half = this.halves.get(track) || 1;
      let offset = this.offsets.get(track) ?? (direction > 0 ? 0 : -half);
      if (!track.matches(':hover')) {
        offset -=
          ((readNumber(track, MOTION_ATTRIBUTES.marqueeSpeed) || MARQUEE.defaultSpeed) +
            Math.abs(velocity) * MARQUEE.velocityBoost) *
          Math.max(k, MARQUEE.minIntensity) *
          direction;
      }
      if (offset <= -half) offset += half;
      if (offset > 0) offset -= half;
      this.offsets.set(track, offset);
      track.style.transform = `translate3d(${offset.toFixed(1)}px, 0, 0) skewX(${(-velocity * MARQUEE.skewDeg * k).toFixed(2)}deg)`;
    }
  }

  /** Con el movimiento apagado, la cinta queda quieta en su posición natural. */
  override apply(frame: FrameState): void {
    if (!frame.off) return;
    for (const track of this.tracks) track.style.transform = '';
  }
}
