import { TILT, TILT_TRANSITION } from '@/design-system/tokens/motion';

import { MOTION_SELECTORS } from '../attributes';
import type { MotionSettings } from '../core/FrameState';
import { PointerEffect } from '../core/MotionEffect';

/** Devuelve la card a su pose natural (y el zoom de su imagen). */
function release(card: HTMLElement): void {
  card.style.transform = '';
  card.style.boxShadow = '';
  card.style.backgroundImage = '';
  const zoom = card.querySelector<HTMLElement>(MOTION_SELECTORS.tiltZoom);
  if (zoom) zoom.style.transform = '';
}

/**
 * Inclinación 3D + brillo que siguen al cursor (`[data-tilt]`, `tilt()` del
 * original, `dc.html:605-622`).
 *
 * Reacciona al `pointermove`, no al loop: la inclinación tiene que responder
 * al instante, y la transición CSS (`TILT_TRANSITION`) la suaviza. Con el
 * movimiento apagado queda el brillo y la sombra, pero la card no se mueve.
 *
 * En el diseño la card inclinada (`tiltEl`) se compartía con el skew por
 * velocidad de las cards de viaje, para que no se pisaran. El skew se sacó
 * por pedido del cliente (octubre 2026): el estado ahora es solo del tilt.
 */
export class TiltEffect extends PointerEffect {
  /** La card inclinada en este momento, o `null`. */
  private current: HTMLElement | null = null;

  override onPointerMove(event: PointerEvent, settings: MotionSettings): void {
    const card =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>(MOTION_SELECTORS.tilt)
        : null;
    if (this.current && this.current !== card) {
      release(this.current);
      this.current = null;
    }
    if (!card) return;

    if (!card.style.transition) card.style.transition = TILT_TRANSITION;
    this.current = card;

    const rect = card.getBoundingClientRect();
    // Posición del cursor dentro de la card, 0–1 en cada eje.
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const k = settings.intensity;
    card.style.backgroundImage = `radial-gradient(${TILT.glowSizePx}px circle at ${x * 100}% ${y * 100}%, ${TILT.glowColor}, transparent ${TILT.glowFadePct}%)`;
    card.style.boxShadow = TILT.shadow;
    if (settings.off) return;

    card.style.transform = `perspective(${TILT.perspectivePx}px) rotateX(${(0.5 - y) * TILT.rotateXDeg * k}deg) rotateY(${(x - 0.5) * TILT.rotateYDeg * k}deg) translateY(${TILT.liftPx}px) scale(${TILT.scale})`;
    const zoom = card.querySelector<HTMLElement>(MOTION_SELECTORS.tiltZoom);
    if (zoom) zoom.style.transform = `scale(${TILT.zoomScale})`;
  }

  /** Si el motor se apaga con una card inclinada, la endereza. */
  override dispose(): void {
    if (!this.current) return;
    release(this.current);
    this.current = null;
  }
}
