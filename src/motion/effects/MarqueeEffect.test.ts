import { describe, expect, it } from 'vitest';

import { MARQUEE } from '@/design-system/tokens/motion';

import { MOTION_ATTRIBUTES, MOTION_SELECTORS } from '../attributes';
import type { FrameState } from '../core/FrameState';

import { MarqueeEffect } from './MarqueeEffect';

type TrackOptions = {
  /** Borde de arriba del riel en el viewport (px); mide 200 de alto. */
  top?: number;
  /** Un ancestro tiene `data-marquee-paused`. */
  paused?: boolean;
  /** Pseudo-clases que matchea ahora (`:hover`, `:focus-within`). */
  matching?: readonly string[];
};

/** Riel falso: lo justo que lee el efecto (atributos, ancho, rect, `matches`, `closest`). */
function fakeTrack({ top = 300, paused = false, matching = [] }: TrackOptions = {}) {
  return {
    scrollWidth: 2000,
    style: { transform: '' },
    getAttribute: (name: string) => (name === MOTION_ATTRIBUTES.marquee ? '1' : null),
    getBoundingClientRect: () => ({ top, bottom: top + 200 }),
    matches: (selector: string) =>
      selector.split(',').some((part) => matching.includes(part.trim())),
    closest: (selector: string) =>
      paused && selector === MOTION_SELECTORS.marqueePaused ? {} : null,
  };
}

type FakeTrack = ReturnType<typeof fakeTrack>;

function frame(off = false): FrameState {
  return {
    intensity: 1.8,
    off,
    time: 0,
    scrollY: 0,
    viewportWidth: 1280,
    viewportHeight: 800,
    velocity: 0,
    intro: 0,
    pointer: { x: 0, y: 0, moved: false, fine: true },
  };
}

/** Corre `frames` frames de layout (mide y después avanza), como el motor con el scroll moviéndose. */
function run(tracks: readonly FakeTrack[], frames: number): void {
  const effect = new MarqueeEffect();
  effect.collect({ querySelectorAll: () => tracks } as unknown as Document);
  for (let i = 0; i < frames; i += 1) {
    effect.measure(frame());
    effect.tick(frame());
  }
}

/** Lo que avanza una cinta por frame sin scroll: velocidad base × intensidad (`dc.html:498`). */
const STEP = MARQUEE.defaultSpeed * 1.8;

describe('MarqueeEffect', () => {
  it('una cinta a la vista avanza su velocidad base en cada frame', () => {
    const track = fakeTrack();
    run([track], 2);
    expect(track.style.transform).toBe(
      `translate3d(${(-2 * STEP).toFixed(1)}px, 0, 0) skewX(0.00deg)`,
    );
  });

  it('una cinta fuera del viewport no avanza ni escribe su transform', () => {
    const below = fakeTrack({ top: 800 + MARQUEE.visibilityMarginPx + 1 });
    const above = fakeTrack({ top: -200 - MARQUEE.visibilityMarginPx - 1 });
    run([below, above], 10);
    expect(below.style.transform).toBe('');
    expect(above.style.transform).toBe('');
  });

  it('dentro del margen ya corre: está a punto de asomar', () => {
    const almost = fakeTrack({ top: 800 + MARQUEE.visibilityMarginPx - 1 });
    run([almost], 1);
    expect(almost.style.transform).not.toBe('');
  });

  it('una cinta dentro de un ancestro con el atributo de pausa no cambia su offset', () => {
    const track = fakeTrack({ paused: true });
    run([track], 10);
    // Escribe (el skew por el scroll sigue), pero el desplazamiento queda en 0.
    expect(track.style.transform).toBe('translate3d(0.0px, 0, 0) skewX(0.00deg)');
  });

  it('con el foco del teclado adentro también se frena, igual que con el mouse encima', () => {
    const focused = fakeTrack({ matching: [':focus-within'] });
    const hovered = fakeTrack({ matching: [':hover'] });
    run([focused, hovered], 10);
    expect(focused.style.transform).toBe('translate3d(0.0px, 0, 0) skewX(0.00deg)');
    expect(hovered.style.transform).toBe('translate3d(0.0px, 0, 0) skewX(0.00deg)');
  });

  it('con el movimiento apagado, la fase de escritura la deja en su lugar', () => {
    const track = fakeTrack();
    track.style.transform = 'translate3d(-40.0px, 0, 0) skewX(0.00deg)';
    const effect = new MarqueeEffect();
    effect.collect({ querySelectorAll: () => [track] } as unknown as Document);
    effect.measure(frame(true));
    effect.tick(frame(true));
    effect.apply(frame(true));
    expect(track.style.transform).toBe('');
  });
});
