import { describe, expect, it } from 'vitest';

import {
  introRevealProgress,
  isFarFromViewport,
  scrollEntryProgress,
  scrollExitProgress,
} from './revealProgress';

const VIEWPORT = 800;

describe('scrollEntryProgress', () => {
  it('es 0 con el elemento todavía abajo del 102% del viewport', () => {
    expect(scrollEntryProgress(900, VIEWPORT, 0, 0.16)).toBe(0);
  });

  it('avanza a lo largo del span (16% del viewport por defecto)', () => {
    // (800 × 1.02 − 800) / (800 × 0.16) = 16 / 128
    expect(scrollEntryProgress(800, VIEWPORT, 0, 0.16)).toBe(0.125);
    expect(scrollEntryProgress(688, VIEWPORT, 0, 0.16)).toBe(1);
  });

  it('cada escalón de delay corre la entrada un 2% del viewport', () => {
    // (816 − 752 − 16) / 128
    expect(scrollEntryProgress(752, VIEWPORT, 1, 0.16)).toBe(0.375);
  });
});

describe('scrollExitProgress', () => {
  it('sale mientras el borde de abajo recorre el 22% superior', () => {
    expect(scrollExitProgress(VIEWPORT, VIEWPORT)).toBe(1);
    expect(scrollExitProgress(88, VIEWPORT)).toBe(0.5);
    expect(scrollExitProgress(-10, VIEWPORT)).toBe(0);
  });
});

describe('introRevealProgress', () => {
  it('corre a 2,2× la intro y atrasa 7% por escalón', () => {
    expect(introRevealProgress(0, 0)).toBe(0);
    expect(introRevealProgress(0.5, 2)).toBeCloseTo(0.96, 10);
    expect(introRevealProgress(1, 7)).toBe(1);
  });
});

describe('isFarFromViewport', () => {
  it('lejos: más de 1,6 viewports abajo o 0,6 arriba', () => {
    expect(isFarFromViewport({ top: 1281, bottom: 1400 }, VIEWPORT)).toBe(true);
    expect(isFarFromViewport({ top: -900, bottom: -481 }, VIEWPORT)).toBe(true);
  });

  it('cerca: cualquier cosa en esa ventana', () => {
    expect(isFarFromViewport({ top: 1280, bottom: 1400 }, VIEWPORT)).toBe(false);
    expect(isFarFromViewport({ top: -900, bottom: -480 }, VIEWPORT)).toBe(false);
  });
});
