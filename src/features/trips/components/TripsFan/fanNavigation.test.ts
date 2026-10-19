import { describe, expect, it } from 'vitest';

import { formatCounter, scrollLeftToReveal, settledSpan, stepIndex } from './fanNavigation';

describe('stepIndex', () => {
  it('avanza y retrocede de a un panel', () => {
    expect(stepIndex(0, 1, 4)).toBe(1);
    expect(stepIndex(2, -1, 4)).toBe(1);
  });

  it('da la vuelta en los extremos', () => {
    expect(stepIndex(3, 1, 4)).toBe(0);
    expect(stepIndex(0, -1, 4)).toBe(3);
  });

  it('con un solo panel se queda en él', () => {
    expect(stepIndex(0, 1, 1)).toBe(0);
    expect(stepIndex(0, -1, 1)).toBe(0);
  });

  it('sin paneles devuelve 0 en vez de NaN', () => {
    expect(stepIndex(0, 1, 0)).toBe(0);
  });
});

describe('formatCounter', () => {
  it('completa con un cero a la izquierda', () => {
    expect(formatCounter(1)).toBe('01');
    expect(formatCounter(4)).toBe('04');
  });

  it('no recorta los números de dos dígitos o más', () => {
    expect(formatCounter(12)).toBe('12');
    expect(formatCounter(120)).toBe('120');
  });
});

describe('settledSpan', () => {
  const SIZES = { closedSize: 88, openSize: 360, gap: 14 };

  it('el primer panel empieza en el borde de la fila', () => {
    expect(settledSpan(0, SIZES)).toEqual({ start: 0, size: 360 });
  });

  it('cada panel anterior suma su ancho cerrado y un gap', () => {
    // 3 × (88 + 14)
    expect(settledSpan(3, SIZES)).toEqual({ start: 306, size: 360 });
  });
});

describe('scrollLeftToReveal', () => {
  const VIEW = { scrollLeft: 200, size: 800 };

  it('no mueve la fila si el panel ya se ve entero', () => {
    expect(scrollLeftToReveal({ start: 300, size: 360 }, VIEW)).toBeNull();
    expect(scrollLeftToReveal({ start: 200, size: 800 }, VIEW)).toBeNull();
  });

  it('alinea el comienzo si el panel quedó cortado a la izquierda', () => {
    expect(scrollLeftToReveal({ start: 102, size: 360 }, VIEW)).toBe(102);
  });

  it('alinea el final si el panel quedó cortado a la derecha', () => {
    // 816 + 360 − 800
    expect(scrollLeftToReveal({ start: 816, size: 360 }, VIEW)).toBe(376);
  });

  it('si el panel no entra en lo que se ve, muestra su comienzo', () => {
    expect(scrollLeftToReveal({ start: 900, size: 360 }, { scrollLeft: 0, size: 320 })).toBe(900);
  });
});
