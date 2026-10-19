import { NAV_OVERLAY } from '@/design-system/tokens/motion';

import { MOTION_SELECTORS } from '../attributes';
import type { FrameState } from '../core/FrameState';
import { ScrollEffect } from '../core/MotionEffect';
import { navSolidProgress } from '../math/cover';

/** Custom property que lee el CSS del nav: 0 transparente, 1 sólido. */
const NAV_SOLID_PROPERTY = '--nav-solid';

/**
 * El nav transparente sobre la foto de portada (`[data-nav-bar]`, pedido del
 * cliente, octubre 2026). No está en el diseño: ahí el nav es siempre de
 * vidrio crema.
 *
 * Si la página tiene una portada con foto debajo del nav (`[data-nav-overlay]`:
 * el hero, la portada de cada viaje), arriba de todo el nav es transparente y
 * se vuelve sólido en los primeros `NAV_OVERLAY.solidDistancePx` de scroll.
 * Sin portada, sólido siempre. El efecto solo escribe un número
 * (`--nav-solid`); colores, fondo y desenfoque los resuelve el CSS del nav.
 *
 * No es movimiento sino estado: con el movimiento apagado se calcula igual
 * (el nav no puede quedar transparente sobre texto).
 */
export class NavBarEffect extends ScrollEffect {
  private nav: HTMLElement | null = null;
  private overlay = false;
  private solid = 1;
  /** Último valor escrito: el nav solo se toca cuando cambia. */
  private written: string | null = null;

  override collect(doc: Document): void {
    this.nav = doc.querySelector<HTMLElement>(MOTION_SELECTORS.navBar);
    this.overlay = doc.querySelector(MOTION_SELECTORS.navOverlay) !== null;
    this.written = null;
  }

  override measure(frame: FrameState): void {
    this.solid = this.overlay ? navSolidProgress(frame.scrollY, NAV_OVERLAY.solidDistancePx) : 1;
  }

  override apply(): void {
    if (!this.nav) return;
    const value = this.solid.toFixed(3);
    if (value === this.written) return;
    this.nav.style.setProperty(NAV_SOLID_PROPERTY, value);
    this.written = value;
  }

  override dispose(): void {
    this.nav?.style.removeProperty(NAV_SOLID_PROPERTY);
    this.nav = null;
    this.written = null;
  }
}
