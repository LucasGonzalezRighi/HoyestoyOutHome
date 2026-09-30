import { describe, expect, it } from 'vitest';

import {
  assertInteger,
  assertOptionalPositive,
  assertPositive,
  assertText,
  assertTextList,
} from './invariants';

describe('assertText', () => {
  it('devuelve el texto si tiene contenido', () => {
    expect(assertText('Hola', 'El saludo')).toBe('Hola');
  });

  it('tira con vacío o solo espacios, nombrando el dato', () => {
    expect(() => assertText('', 'El saludo')).toThrow('El saludo no puede quedar en blanco.');
    expect(() => assertText('   ', 'El saludo')).toThrow('El saludo');
  });
});

describe('assertInteger', () => {
  it('acepta enteros dentro del rango inclusivo', () => {
    expect(assertInteger(1, 'La nota', { min: 1, max: 5 })).toBe(1);
    expect(assertInteger(5, 'La nota', { min: 1, max: 5 })).toBe(5);
  });

  it('tira con decimales o fuera de rango, diciendo qué llegó', () => {
    expect(() => assertInteger(1.5, 'La nota')).toThrow('(llegó 1.5)');
    expect(() => assertInteger(6, 'La nota', { min: 1, max: 5 })).toThrow('entre 1 y 5');
    expect(() => assertInteger(-1, 'La nota', { min: 0 })).toThrow('mayor o igual a 0');
  });
});

describe('assertPositive', () => {
  it('tira con 0, negativos y no finitos', () => {
    expect(assertPositive(0.5, 'La distancia')).toBe(0.5);
    expect(() => assertPositive(0, 'La distancia')).toThrow('mayor que 0');
    expect(() => assertPositive(Number.NaN, 'La distancia')).toThrow('mayor que 0');
    expect(() => assertPositive(Number.POSITIVE_INFINITY, 'La distancia')).toThrow();
  });

  it('en la versión opcional, deja pasar undefined', () => {
    expect(assertOptionalPositive(undefined, 'La distancia')).toBeUndefined();
    expect(() => assertOptionalPositive(-3, 'La distancia')).toThrow();
  });
});

describe('assertTextList', () => {
  it('devuelve una copia congelada', () => {
    const source = ['a', 'b'];
    const list = assertTextList(source, 'La lista');
    expect(list).toEqual(['a', 'b']);
    expect(list).not.toBe(source);
    expect(Object.isFrozen(list)).toBe(true);
  });

  it('tira con listas vacías o ítems en blanco', () => {
    expect(() => assertTextList([], 'La lista')).toThrow('al menos un elemento');
    expect(() => assertTextList(['a', ' '], 'La lista')).toThrow('posición 1');
  });
});
