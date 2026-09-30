import { describe, expect, it } from 'vitest';

import {
  DEFAULT_MOTION_LEVEL,
  MOTION_LEVELS,
  resolveMotionLevel,
  REVEAL_TRANSITION,
  SETTLE_MS,
} from './motion';

/** Duraciones de una lista de `transition` de CSS, en ms (`.75s` → 750, `200ms` → 200). */
function transitionDurationsMs(transition: string): number[] {
  return [...transition.matchAll(/(\d*\.?\d+)(ms|s)\b/g)].map(
    ([, value, unit]) => Number(value) * (unit === 's' ? 1000 : 1),
  );
}

describe('SETTLE_MS', () => {
  it('dura al menos la transición más larga de los reveals (si no, un contador puede congelarse a mitad)', () => {
    const durations = transitionDurationsMs(REVEAL_TRANSITION);
    expect(durations).not.toHaveLength(0);
    expect(SETTLE_MS).toBeGreaterThanOrEqual(Math.max(...durations));
  });
});

describe('resolveMotionLevel', () => {
  it('acepta los cuatro niveles tal cual', () => {
    for (const level of Object.keys(MOTION_LEVELS)) {
      expect(resolveMotionLevel(level)).toBe(level);
    }
  });

  it('tolera mayúsculas y espacios, como los escribe la perilla del diseño', () => {
    expect(resolveMotionLevel('Exagerado')).toBe('exagerado');
    expect(resolveMotionLevel('  SUAVE ')).toBe('suave');
  });

  it('cae en el default si la variable falta, está vacía o tiene un typo', () => {
    expect(DEFAULT_MOTION_LEVEL).toBe('exagerado');
    expect(resolveMotionLevel(undefined)).toBe(DEFAULT_MOTION_LEVEL);
    expect(resolveMotionLevel('')).toBe(DEFAULT_MOTION_LEVEL);
    expect(resolveMotionLevel('exajerado')).toBe(DEFAULT_MOTION_LEVEL);
  });

  it('no confunde propiedades heredadas de Object con un nivel', () => {
    expect(resolveMotionLevel('toString')).toBe(DEFAULT_MOTION_LEVEL);
    expect(resolveMotionLevel('constructor')).toBe(DEFAULT_MOTION_LEVEL);
  });
});
