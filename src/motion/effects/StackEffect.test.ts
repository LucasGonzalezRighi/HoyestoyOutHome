import { describe, expect, it } from 'vitest';

import type { FrameState } from '../core/FrameState';
import { StyleWriter } from '../core/StyleWriter';

import { StackEffect } from './StackEffect';

type FakeCard = { style: { transform?: string; filter?: string } };

/** Envoltorio sticky falso: su primer hijo es la card; su `top` es lo único que se mide. */
function wrapper(top: number, card: FakeCard | null) {
  return { firstElementChild: card, getBoundingClientRect: () => ({ top }) };
}

function stackDocument(wrappers: ReturnType<typeof wrapper>[]): Document {
  return { querySelectorAll: () => wrappers } as unknown as Document;
}

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

function run(wrappers: ReturnType<typeof wrapper>[], off = false): void {
  const effect = new StackEffect(new StyleWriter());
  effect.collect(stackDocument(wrappers));
  effect.measure();
  effect.apply(frame(off));
}

describe('StackEffect', () => {
  it('achica, gira y oscurece la card tapada con las fórmulas de dc.html:545-547', () => {
    const covered: FakeCard = { style: {} };
    // La siguiente está a mitad de camino: (800 − 445) / (800 − 90) = 0.5
    run([wrapper(90, covered), wrapper(445, { style: {} })]);
    expect(covered.style).toEqual({
      transform: 'scale(0.9370) rotate(-1.62deg)',
      filter: 'brightness(0.860)',
    });
  });

  it('la última card del grupo queda sin transformar', () => {
    const last: FakeCard = { style: {} };
    run([wrapper(90, { style: {} }), wrapper(104, last)]);
    expect(last.style).toEqual({ transform: '', filter: '' });
  });

  it('anima cualquier primer hijo con estilo (un <svg> también), como el original', () => {
    // No es un HTMLElement: solo tiene `style`, igual que un SVGElement.
    const svgCard: FakeCard = { style: {} };
    run([wrapper(90, svgCard), wrapper(90, { style: {} })]);
    expect(svgCard.style.transform).toBe('scale(0.8740) rotate(-3.24deg)');
  });

  it('un envoltorio sin hijos se saltea sin romper el resto', () => {
    const covered: FakeCard = { style: {} };
    run([wrapper(90, null), wrapper(90, covered), wrapper(800, { style: {} })]);
    expect(covered.style).toEqual({ transform: 'scale(1.0000) rotate(0.00deg)', filter: '' });
  });

  it('con el movimiento apagado, todas quedan en su pose natural', () => {
    const covered: FakeCard = { style: {} };
    run([wrapper(90, covered), wrapper(90, { style: {} })], true);
    expect(covered.style).toEqual({ transform: '', filter: '' });
  });
});
