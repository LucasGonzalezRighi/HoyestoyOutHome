import { describe, expect, it } from 'vitest';

import { pinSplitProgress } from './pinSplit';

const VH = 900;
const FOOTER = 120;
/** Envoltorio de escritorio: 240vh de recorrido + el footer. */
const HEIGHT = VH * 2.4 + FOOTER;
const TRAVEL = HEIGHT - VH - FOOTER;

describe('pinSplitProgress fijo (escritorio)', () => {
  it('arranca cerrada y sin contenido cuando recién se fija', () => {
    const p = pinSplitProgress({
      top: 0,
      height: HEIGHT,
      viewportHeight: VH,
      exitHeight: FOOTER,
      exitTop: HEIGHT,
    });
    expect(p.pinned).toBe(true);
    expect(p.enter).toBe(1);
    expect(p.open).toBe(0);
    expect(p.reveal).toBe(0);
    expect(p.exit).toBe(0);
  });

  it('abre la palabra antes de mostrar el contenido', () => {
    const top = -TRAVEL * 0.45;
    const p = pinSplitProgress({
      top,
      height: HEIGHT,
      viewportHeight: VH,
      exitHeight: FOOTER,
      exitTop: top + HEIGHT,
    });
    expect(p.open).toBeGreaterThan(0.8);
    expect(p.reveal).toBeLessThan(0.1);
  });

  it('termina abierta y con el contenido a la vista', () => {
    const top = -TRAVEL * 0.8;
    const p = pinSplitProgress({
      top,
      height: HEIGHT,
      viewportHeight: VH,
      exitHeight: FOOTER,
      exitTop: top + HEIGHT,
    });
    expect(p.open).toBe(1);
    expect(p.reveal).toBe(1);
  });

  it('la salida sigue al footer cuando sube por encima', () => {
    const p = pinSplitProgress({
      top: -TRAVEL,
      height: HEIGHT,
      viewportHeight: VH,
      exitHeight: FOOTER,
      exitTop: VH - FOOTER,
    });
    expect(p.exit).toBe(1);
  });
});

describe('pinSplitProgress sin lugar para fijarse (teléfono)', () => {
  it('se abre a medida que entra y no tiene salida', () => {
    const shortHeight = VH * 1.2;
    const before = pinSplitProgress({
      top: VH,
      height: shortHeight,
      viewportHeight: VH,
      exitHeight: 0,
      exitTop: VH * 3,
    });
    const after = pinSplitProgress({
      top: VH * 0.2,
      height: shortHeight,
      viewportHeight: VH,
      exitHeight: 0,
      exitTop: VH * 2,
    });
    expect(before.pinned).toBe(false);
    expect(before.open).toBe(0);
    expect(after.open).toBe(1);
    expect(after.exit).toBe(0);
  });
});
