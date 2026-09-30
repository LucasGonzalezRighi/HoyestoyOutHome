import { describe, expect, it } from 'vitest';

import { Metric } from './Metric';

describe('Metric', () => {
  it('formatea con prefijo, miles en es-AR y sufijo', () => {
    const gain = new Metric({ value: 1900, prefix: '+', suffix: ' m', label: 'Desnivel positivo' });
    expect(gain.format()).toBe('+1.900 m');
    expect(gain.formattedValue()).toBe('1.900');
    expect(gain.value).toBe(1900);
  });

  it('sin prefijo ni sufijo muestra solo el número', () => {
    expect(new Metric({ value: 44, suffix: ' km', label: 'Distancia total' }).format()).toBe(
      '44 km',
    );
    expect(new Metric({ value: 4, suffix: ' días', label: 'De travesía' }).format()).toBe('4 días');
    expect(new Metric({ value: 3, label: 'Noches' }).format()).toBe('3');
  });

  it('tira con valores negativos o no finitos, o sin bajada', () => {
    expect(() => new Metric({ value: -1, label: 'x' })).toThrow('≥ 0');
    expect(() => new Metric({ value: Number.NaN, label: 'x' })).toThrow();
    expect(() => new Metric({ value: 1, label: '' })).toThrow('La bajada de la métrica');
  });
});
