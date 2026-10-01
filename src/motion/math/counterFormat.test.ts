import { describe, expect, it } from 'vitest';

import { counterValue, formatCounterValue, parseCounterFormat } from './counterFormat';

describe('formatCounterValue', () => {
  it('thousands agrega .000 al valor en miles (precio de Calle & Stepanek)', () => {
    expect(formatCounterValue(690, 'thousands')).toBe('690.000');
  });

  it('plain usa el separador de miles de es-AR (desnivel de Lolog)', () => {
    expect(formatCounterValue(1900, 'plain')).toBe('1.900');
  });

  it('da lo mismo que toLocaleString, que es lo que usaba el original', () => {
    for (const value of [0, 3, 44, 950, 1900, 12345, 690000]) {
      expect(formatCounterValue(value, 'plain')).toBe(value.toLocaleString('es-AR'));
    }
  });
});

describe('counterValue', () => {
  it('redondea al entero mientras sube', () => {
    expect(counterValue(1900, 0.5)).toBe(950);
    expect(counterValue(44, 0.51)).toBe(22);
    expect(counterValue(690, 0.2)).toBe(138);
  });

  it('arranca en 0 y termina en el valor final', () => {
    expect(counterValue(44, 0)).toBe(0);
    expect(counterValue(44, 1)).toBe(44);
  });

  it('con el formateo, arma el texto de mitad de camino', () => {
    expect(formatCounterValue(counterValue(690, 0.2), 'thousands')).toBe('138.000');
  });
});

describe('parseCounterFormat', () => {
  it('solo thousands cambia el formato', () => {
    expect(parseCounterFormat('thousands')).toBe('thousands');
    expect(parseCounterFormat(null)).toBe('plain');
    expect(parseCounterFormat('k')).toBe('plain');
  });
});
