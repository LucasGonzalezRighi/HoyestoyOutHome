import { MARQUEE } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES, MOTION_SELECTORS } from '../attributes';
import { queryAll, readNumber } from '../core/dom';
import type { FrameState } from '../core/FrameState';
import { FrameEffect } from '../core/MotionEffect';

/**
 * La cinta no avanza con el mouse encima (como en el diseño) ni con el foco
 * del teclado adentro: con teclado o en pantalla táctil no hay hover, y una
 * cinta de frases que no se puede frenar incumple WCAG 2.2.2.
 */
const HELD_SELECTOR = ':hover, :focus-within';

/**
 * Cintas infinitas (`[data-marquee]`, `dc.html:495-501`).
 *
 * El riel trae su contenido duplicado; el efecto lo corre hacia la izquierda
 * (o la derecha con dirección -1) y, al completar medio ancho, lo vuelve a
 * empezar: como las dos mitades son iguales, el salto no se ve. El scroll la
 * acelera y la inclina según su velocidad.
 *
 * Se frena (deja de avanzar, pero sigue inclinándose con el scroll) con el
 * mouse encima, con el foco adentro o si un ancestro tiene
 * `data-marquee-paused` (el botón de `MarqueePauseGroup`). El atributo se
 * consulta en cada frame: el `MutationObserver` del motor no re-escanea por
 * cambios de atributos.
 *
 * Dos diferencias con el original (CLAUDE.md §9):
 *
 * - Las cintas fuera del viewport (con `MARQUEE.visibilityMarginPx` de margen)
 *   no avanzan ni escriben: conservan su desplazamiento y, al volver a entrar,
 *   siguen desde ahí. Como el loop es continuo, no se nota. La visibilidad se
 *   mide en `measure`, que corre antes que `tick` en los frames de layout
 *   (cada cambio de scroll o viewport, y después de cada re-escaneo).
 * - El freno por foco y por pausa (arriba).
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
  /** Si cada riel está en el viewport (con margen), según la última medición. */
  private readonly visible = new WeakMap<HTMLElement, boolean>();

  override collect(doc: Document): void {
    this.tracks = queryAll(doc, MOTION_SELECTORS.marquee);
    for (const track of this.tracks) this.halves.set(track, track.scrollWidth / 2);
  }

  /**
   * Fase de lectura: qué cintas están a la vista. Se mide también con el
   * movimiento apagado, para que al volver (reduced motion apagado en vivo)
   * las cintas sepan si se ven sin esperar al próximo scroll.
   */
  override measure(frame: FrameState): void {
    const margin = MARQUEE.visibilityMarginPx;
    for (const track of this.tracks) {
      const rect = track.getBoundingClientRect();
      this.visible.set(track, rect.bottom > -margin && rect.top < frame.viewportHeight + margin);
    }
  }

  override tick(frame: FrameState): void {
    if (frame.off) return;
    const { velocity, intensity: k } = frame;
    for (const track of this.tracks) {
      // Sin medir todavía cuenta como visible: ante la duda, se mueve como en el original.
      if (this.visible.get(track) === false) continue;
      const direction = readNumber(track, MOTION_ATTRIBUTES.marquee) || 1;
      const half = this.halves.get(track) || 1;
      let offset = this.offsets.get(track) ?? (direction > 0 ? 0 : -half);
      if (!this.isHeld(track)) {
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

  /** La cinta está frenada: mouse encima, foco adentro o pausa pedida por un ancestro. */
  private isHeld(track: HTMLElement): boolean {
    return track.matches(HELD_SELECTOR) || track.closest(MOTION_SELECTORS.marqueePaused) !== null;
  }
}
