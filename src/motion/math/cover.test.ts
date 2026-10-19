import { describe, expect, it } from 'vitest';

import { coverProgress, coverStickyTop, navSolidProgress } from './cover';

describe('coverStickyTop', () => {
  it('fija arriba una sección más baja que la pantalla', () => {
    expect(coverStickyTop(900, 700)).toBe(0);
  });

  it('fija una sección alta cuando su borde de abajo toca el de la pantalla', () => {
    expect(coverStickyTop(844, 2000)).toBe(-1156);
  });
});

describe('coverProgress', () => {
  it('va de 0 (la sección que sube asoma abajo) a 1 (llegó arriba)', () => {
    expect(coverProgress(900, 900)).toBe(0);
    expect(coverProgress(450, 900)).toBe(0.5);
    expect(coverProgress(0, 900)).toBe(1);
  });

  it('se queda en los extremos fuera de ese tramo', () => {
    expect(coverProgress(1400, 900)).toBe(0);
    expect(coverProgress(-300, 900)).toBe(1);
  });
});

describe('navSolidProgress', () => {
  it('pasa de transparente a sólido en la distancia dada', () => {
    expect(navSolidProgress(0, 140)).toBe(0);
    expect(navSolidProgress(70, 140)).toBe(0.5);
    expect(navSolidProgress(400, 140)).toBe(1);
  });
});
