import { describe, expect, it } from 'vitest';

import { formatCounter, parseCounterFormat } from './counterFormat';

describe('formatCounter', () => {
  it('thousands agrega .000 al valor en miles (precio de Calle & Stepanek)', () => {
    expect(formatCounter(690, 1, 'thousands')).toBe('690.000');
  });

  it('plain usa el separador de miles de es-AR (desnivel de Lolog)', () => {
    expect(formatCounter(1900, 1, 'plain')).toBe('1.900');
  });

  it('redondea al entero mientras sube', () => {
    expect(formatCounter(1900, 0.5, 'plain')).toBe('950');
    expect(formatCounter(44, 0.51, 'plain')).toBe('22');
    expect(formatCounter(690, 0.2, 'thousands')).toBe('138.000');
  });

  it('arranca en 0', () => {
    expect(formatCounter(44, 0, 'plain')).toBe('0');
  });
});

describe('parseCounterFormat', () => {
  it('solo thousands cambia el formato', () => {
    expect(parseCounterFormat('thousands')).toBe('thousands');
    expect(parseCounterFormat(null)).toBe('plain');
    expect(parseCounterFormat('k')).toBe('plain');
  });
});
