import { describe, expect, it } from 'vitest';

import { MOTION_ATTRIBUTES } from '../attributes';
import type { FrameState } from '../core/FrameState';

import { CounterEffect } from './CounterEffect';

/** Contador falso: anota cada texto que se le escribe; `top` se puede mover entre frames. */
function fakeCounter(target: number, format: string | null = null) {
  const writes: string[] = [];
  const state = { top: 0 };
  const element = {
    getAttribute: (name: string) => {
      if (name === MOTION_ATTRIBUTES.count) return String(target);
      if (name === MOTION_ATTRIBUTES.countFormat) return format;
      return null;
    },
    getBoundingClientRect: () => ({ top: state.top }),
    set textContent(text: string) {
      writes.push(text);
    },
  };
  return { element, state, writes };
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

/** Un frame de layout: mide y escribe, como lo hace el motor. */
function runFrame(effect: CounterEffect, current = frame()): void {
  effect.measure();
  effect.apply(current);
}

describe('CounterEffect', () => {
  it('escribe el texto formateado del entero de mitad de camino', () => {
    const counter = fakeCounter(1900);
    const effect = new CounterEffect();
    effect.collect({ querySelectorAll: () => [counter.element] } as unknown as Document);

    // (800 − 600) / (800 × 0,5) = 0,5 → ease(0,5) = 0,5 → 950.
    counter.state.top = 600;
    runFrame(effect);

    expect(counter.writes).toEqual(['950']);
  });

  it('no vuelve a escribir mientras el entero no cambie, aunque el contador se mueva', () => {
    const counter = fakeCounter(4);
    const effect = new CounterEffect();
    effect.collect({ querySelectorAll: () => [counter.element] } as unknown as Document);

    // Tres posiciones distintas que redondean a 2 de 4 (progreso ~0,5).
    for (const top of [600, 598, 602]) {
      counter.state.top = top;
      runFrame(effect);
    }
    counter.state.top = 0; // ya pasó la mitad del viewport: valor final
    runFrame(effect);

    expect(counter.writes).toEqual(['2', '4']);
  });

  it('con el movimiento apagado muestra el valor final, con su formato', () => {
    const counter = fakeCounter(690, 'thousands');
    const effect = new CounterEffect();
    effect.collect({ querySelectorAll: () => [counter.element] } as unknown as Document);

    counter.state.top = 5000; // muy abajo: con movimiento estaría en 0
    runFrame(effect, frame(true));

    expect(counter.writes).toEqual(['690.000']);
  });
});
