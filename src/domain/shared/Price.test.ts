import { describe, expect, it } from 'vitest';

import { Price } from './Price';

describe('Price', () => {
  it('con monto: se formatea en es-AR y expone el monto', () => {
    const price = Price.of(690000);
    expect(price.isOnRequest).toBe(false);
    expect(price.amount).toBe(690000);
    expect(price.label()).toBe('$690.000');
  });

  it('el símbolo de la moneda es el que antepone label()', () => {
    expect(Price.CURRENCY_SYMBOL).toBe('$');
    expect(Price.of(200000).label().startsWith(Price.CURRENCY_SYMBOL)).toBe(true);
  });

  it('en miles: el número que anima el contador del cierre', () => {
    expect(Price.of(690000).inThousands()).toBe(690);
  });

  it('a consultar: dice "Consultar" y no tiene monto', () => {
    const price = Price.onRequest();
    expect(price.isOnRequest).toBe(true);
    expect(price.label()).toBe('Consultar');
    expect(() => price.amount).toThrow('a consultar');
    expect(() => price.inThousands()).toThrow('a consultar');
  });

  it('tira con montos que no son pesos enteros positivos', () => {
    expect(() => Price.of(0)).toThrow('El precio en pesos');
    expect(() => Price.of(-1000)).toThrow();
    expect(() => Price.of(1500.5)).toThrow();
  });

  it('inThousands tira si el monto no es redondo en miles', () => {
    expect(() => Price.of(690500).inThousands()).toThrow('$690.500');
  });
});
