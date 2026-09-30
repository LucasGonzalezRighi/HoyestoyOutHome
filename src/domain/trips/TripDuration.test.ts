import { describe, expect, it } from 'vitest';

import { TripDuration } from './TripDuration';

describe('TripDuration', () => {
  it('label() usa plural para varios días y noches', () => {
    expect(new TripDuration(4, 3).label()).toBe('4 días / 3 noches');
  });

  it('label() usa singular para una sola noche', () => {
    expect(new TripDuration(2, 1).label()).toBe('2 días / 1 noche');
    expect(new TripDuration(1, 0).label()).toBe('1 día / 0 noches');
  });

  it('sentence() es el formato con coma de los tags', () => {
    expect(new TripDuration(4, 3).sentence()).toBe('4 días, 3 noches');
  });

  it('tira con negativos, decimales o más noches que días', () => {
    expect(() => new TripDuration(-1, 0)).toThrow('Los días del viaje');
    expect(() => new TripDuration(3, 1.5)).toThrow('Las noches del viaje');
    expect(() => new TripDuration(2, 3)).toThrow('más noches que días');
  });
});
