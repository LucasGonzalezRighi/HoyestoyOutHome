import { describe, expect, it } from 'vitest';

import { formatCount, formatKilometers, formatMeters, formatNumber } from './formatters';

describe('formatNumber', () => {
  it('agrupa miles con punto, también los de cuatro cifras (es-AR, no es)', () => {
    expect(formatNumber(1900)).toBe('1.900');
    expect(formatNumber(690000)).toBe('690.000');
  });

  it('usa coma decimal y no rellena con ceros', () => {
    expect(formatNumber(11.3)).toBe('11,3');
    expect(formatNumber(12)).toBe('12');
  });

  it('respeta los decimales fijos si se piden', () => {
    expect(formatNumber(12, 1)).toBe('12,0');
    expect(formatNumber(8.849, 2)).toBe('8,85');
  });
});

describe('formatCount', () => {
  it('usa singular solo para 1', () => {
    expect(formatCount(1, 'noche', 'noches')).toBe('1 noche');
    expect(formatCount(3, 'noche', 'noches')).toBe('3 noches');
  });

  it('va en plural con 0 y con decimales', () => {
    expect(formatCount(0, 'noche', 'noches')).toBe('0 noches');
    expect(formatCount(1.5, 'h', 'hs')).toBe('1,5 hs');
  });
});

describe('unidades', () => {
  it('formatea kilómetros y metros', () => {
    expect(formatKilometers(24)).toBe('24 km');
    expect(formatKilometers(11.3)).toBe('11,3 km');
    expect(formatMeters(1400)).toBe('1.400 m');
  });
});
