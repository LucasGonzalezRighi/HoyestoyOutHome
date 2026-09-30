import { describe, expect, it } from 'vitest';

import { revealStyles, truncateDecimals, wordRevealTransform } from './revealTransforms';

/*
  Valores calculados con el `switch` original del diseño (`dc.html:581-594`)
  copiado tal cual. Si alguno falla, la coreografía dejó de ser la del diseño.
*/

describe('revealStyles', () => {
  it('left: entra 90px × k desde la izquierda con 3° × k de giro', () => {
    expect(revealStyles('left', 0, 1, 1.8)).toEqual({
      transform: 'translate3d(-162px, 0px, 0) rotate(-5.4deg)',
      opacity: '0.000',
      clipPath: undefined,
    });
  });

  it('right: espejo de left, y sale subiendo 50px × k', () => {
    expect(revealStyles('right', 0.5, 0.75, 1).transform).toBe(
      'translate3d(45px, -12.5px, 0) rotate(1.5deg)',
    );
  });

  it('up: en su lugar cuando entró del todo y sigue en pantalla', () => {
    expect(revealStyles('up', 1, 1, 1.8)).toEqual({
      transform: 'translate3d(0, 0px, 0)',
      opacity: '1.000',
      clipPath: undefined,
    });
  });

  it('corta (no redondea) a tres decimales, como el replace del original', () => {
    expect(revealStyles('up', 0.3333333, 1, 1)).toEqual({
      transform: 'translate3d(0, 46.666px, 0)',
      opacity: '0.333',
      clipPath: undefined,
    });
  });

  it('rotate (el rot del diseño): sube 120px girando 9° desde el 88%', () => {
    expect(revealStyles('rotate', 0, 1, 1).transform).toBe(
      'translate3d(0, 120px, 0) rotate(-9deg) scale(0.88)',
    );
  });

  it('roll: rueda 300° desde la izquierda', () => {
    expect(revealStyles('roll', 0.5, 1, 1)).toMatchObject({
      transform: 'translate3d(-90px, 0, 0) rotate(-150deg) scale(0.8)',
      opacity: '0.500',
    });
  });

  it('flip: el giro topea en k = 1.2', () => {
    expect(revealStyles('flip', 0, 1, 1.8).transform).toBe(
      'perspective(900px) rotateX(84deg) translate3d(0, 60px, 0)',
    );
  });

  it('clip: recorta con clip-path y deja la opacidad en 1', () => {
    expect(revealStyles('clip', 0.25, 1, 1.8)).toEqual({
      transform: 'scale(1.112)',
      opacity: '1.000',
      clipPath: 'inset(75.00% 0 0 0 round 32px)',
    });
  });

  it('zoom: crece desde el 55% y no escala con la intensidad', () => {
    expect(revealStyles('zoom', 0, 0.5, 1.8).transform).toBe(
      'scale(0.55) translate3d(0, -30px, 0)',
    );
  });

  it('scale: el achique topea en k = 1.4', () => {
    expect(revealStyles('scale', 0, 1, 1.8).transform).toBe('translate3d(0, 72px, 0) scale(0.65)');
  });

  it('expand: nunca baja del 30% de opacidad', () => {
    expect(revealStyles('expand', 0, 1, 1)).toMatchObject({
      transform: 'translate3d(0, 120px, 0) scale(0.78)',
      opacity: '0.300',
    });
    expect(revealStyles('expand', 1, 0, 1)).toMatchObject({
      transform: 'translate3d(0, -40px, 0) scale(0.94)',
      opacity: '0.300',
    });
  });

  it('una variante desconocida o ausente se comporta como up (el default del switch)', () => {
    const up = revealStyles('up', 0, 1, 1);
    expect(revealStyles('nope', 0, 1, 1)).toEqual(up);
    expect(revealStyles(null, 0, 1, 1)).toEqual(up);
    expect(up.transform).toBe('translate3d(0, 70px, 0)');
  });
});

describe('wordRevealTransform', () => {
  it('arranca escondida debajo de la máscara (110%) y girada 8°', () => {
    expect(wordRevealTransform(0, 0)).toBe('translate3d(0, 110.00%, 0) rotate(8.00deg)');
  });

  it('termina derecha y en su lugar', () => {
    expect(wordRevealTransform(1, 0)).toBe('translate3d(0, 0.00%, 0) rotate(0.00deg)');
  });

  it('cada palabra se atrasa un 7% de la intro', () => {
    expect(wordRevealTransform(0.25, 3)).toBe('translate3d(0, 92.71%, 0) rotate(6.74deg)');
  });
});

describe('truncateDecimals', () => {
  it('deja tres decimales como máximo y no toca el resto', () => {
    expect(truncateDecimals('translate3d(12.3456789px, -0.1234px, 0) scale(1.5)')).toBe(
      'translate3d(12.345px, -0.123px, 0) scale(1.5)',
    );
  });
});
