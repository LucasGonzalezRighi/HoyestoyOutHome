import { describe, expect, it } from 'vitest';

import { IntroClock } from './IntroClock';
import { ScrollTracker } from './ScrollTracker';
import { StyleWriter } from './StyleWriter';

/** Lo único que `ScrollTracker` lee del elemento que scrollea. */
function scrollerAt(scrollTop: number): Element {
  return { scrollTop } as unknown as Element;
}

describe('ScrollTracker', () => {
  it('suaviza la velocidad: 12% hacia el salto de cada frame', () => {
    const tracker = new ScrollTracker();
    expect(tracker.sample(scrollerAt(100))).toEqual({ scrollY: 100, velocity: 12 });
    // 12 + (0 − 12) × 0.12
    expect(tracker.sample(scrollerAt(100)).velocity).toBeCloseTo(10.56, 10);
  });

  it('topea la velocidad en ±60 px/frame', () => {
    const tracker = new ScrollTracker();
    expect(tracker.sample(scrollerAt(10_000)).velocity).toBe(60);
  });

  it('por debajo de 0.05 la velocidad es 0', () => {
    const tracker = new ScrollTracker();
    expect(tracker.sample(scrollerAt(0.4)).velocity).toBe(0);
  });
});

describe('IntroClock', () => {
  it('queda en 0 hasta que se programa', () => {
    expect(new IntroClock(1600).progress(5000)).toBe(0);
  });

  it('avanza de 0 a 1 en la duración, desde el momento programado', () => {
    const clock = new IntroClock(1600);
    clock.begin(1000);
    expect(clock.progress(500)).toBe(0);
    expect(clock.progress(1800)).toBe(0.5);
    expect(clock.progress(9000)).toBe(1);
  });
});

describe('StyleWriter', () => {
  it('no reescribe un estilo que no cambió', () => {
    const writes: string[] = [];
    const style = {
      set transform(value: string) {
        writes.push(value);
      },
    };
    const element = { style } as unknown as HTMLElement;
    const writer = new StyleWriter();

    writer.set(element, 'transform', 'scale(1)');
    writer.set(element, 'transform', 'scale(1)');
    writer.set(element, 'transform', 'scale(2)');

    expect(writes).toEqual(['scale(1)', 'scale(2)']);
  });
});
