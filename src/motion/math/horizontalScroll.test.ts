import { describe, expect, it } from 'vitest';

import { horizontalDistance, horizontalProgress, scrollTopToShowItem } from './horizontalScroll';

/** Riel de 2400 px en un viewport de 1280: recorre 1120 px. */
const DISTANCE = horizontalDistance(2400, 1280);
/** La sección empieza a 3000 px del tope de la página. */
const SECTION_TOP = 3000;

describe('horizontalDistance', () => {
  it('es lo que el riel mide de más respecto del viewport (dc.html:535)', () => {
    expect(DISTANCE).toBe(1120);
  });

  it('es 0 si el riel entra entero', () => {
    expect(horizontalDistance(900, 1280)).toBe(0);
  });
});

describe('horizontalProgress', () => {
  it('es la fórmula del original: clamp(−top / max(1, distancia)) (dc.html:537)', () => {
    expect(horizontalProgress(560, DISTANCE)).toBe(0.5);
    expect(horizontalProgress(-200, DISTANCE)).toBe(0);
    expect(horizontalProgress(5000, DISTANCE)).toBe(1);
  });

  it('con distancia 0 no divide por cero', () => {
    expect(horizontalProgress(0, 0)).toBe(0);
    expect(horizontalProgress(40, 0)).toBe(1);
  });
});

describe('scrollTopToShowItem', () => {
  it('el primer ítem (el que ya está en el gutter) pide el comienzo de la sección', () => {
    expect(
      scrollTopToShowItem({ sectionTop: SECTION_TOP, itemOffset: 0, distance: DISTANCE }),
    ).toBe(SECTION_TOP);
  });

  it('un ítem a mitad del riel pide el scroll que lo trae al gutter', () => {
    // La card a 832 px del comienzo del riel: 3000 + (832 / 1120) × 1120.
    expect(
      scrollTopToShowItem({ sectionTop: SECTION_TOP, itemOffset: 832, distance: DISTANCE }),
    ).toBe(3832);
  });

  it('los ítems del final, que no llegan al gutter, piden el final del recorrido', () => {
    expect(
      scrollTopToShowItem({ sectionTop: SECTION_TOP, itemOffset: 1724, distance: DISTANCE }),
    ).toBe(SECTION_TOP + DISTANCE);
  });

  it('si el riel no se mueve (distancia 0), pide el comienzo de la sección', () => {
    expect(scrollTopToShowItem({ sectionTop: SECTION_TOP, itemOffset: 400, distance: 0 })).toBe(
      SECTION_TOP,
    );
  });

  it('es el inverso del efecto: en ese scroll, la traslación del riel es −itemOffset', () => {
    for (const itemOffset of [0, 1, 406, 832, 1119, 1120]) {
      const scrollTop = scrollTopToShowItem({
        sectionTop: SECTION_TOP,
        itemOffset,
        distance: DISTANCE,
      });
      // El efecto: top de la sección en el viewport = sectionTop − scroll.
      const progress = horizontalProgress(-(SECTION_TOP - scrollTop), DISTANCE);
      expect(-progress * DISTANCE).toBeCloseTo(-itemOffset, 9);
    }
  });
});
