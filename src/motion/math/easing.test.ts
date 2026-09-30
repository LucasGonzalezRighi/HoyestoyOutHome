import { describe, expect, it } from 'vitest';

import { clamp, clamp01 } from './clamp';
import { easeInOutCubic } from './easing';

describe('easeInOutCubic', () => {
  it('fija los extremos y el punto medio', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
  });

  it('arranca lento y termina lento (simétrica)', () => {
    expect(easeInOutCubic(0.25)).toBe(0.0625);
    expect(easeInOutCubic(0.75)).toBe(0.9375);
  });
});

describe('clamp01', () => {
  it('recorta a [0, 1]', () => {
    expect(clamp01(-0.2)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(3)).toBe(1);
  });

  it('deja pasar NaN, como el original (el CSS descarta el valor)', () => {
    expect(clamp01(Number.NaN)).toBeNaN();
  });
});

describe('clamp', () => {
  it('recorta a un rango cualquiera', () => {
    expect(clamp(75, -60, 60)).toBe(60);
    expect(clamp(-75, -60, 60)).toBe(-60);
    expect(clamp(12, -60, 60)).toBe(12);
  });
});
