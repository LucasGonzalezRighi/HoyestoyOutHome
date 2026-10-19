import { describe, expect, it } from 'vitest';

import { CalendarDate } from './CalendarDate';

const parse = (iso: string) => CalendarDate.parse(iso, 'La fecha');

describe('CalendarDate', () => {
  it('lee una fecha ISO y expone sus partes', () => {
    const date = parse('2026-11-13');
    expect(date.year).toBe(2026);
    expect(date.month).toBe(11);
    expect(date.day).toBe(13);
    expect(date.iso).toBe('2026-11-13');
    expect(date.monthKey()).toBe('2026-11');
  });

  it('suma días cruzando mes, año y el 29 de febrero', () => {
    expect(parse('2026-11-28').addDays(3).iso).toBe('2026-12-01');
    expect(parse('2026-12-30').addDays(3).iso).toBe('2027-01-02');
    expect(parse('2028-02-28').addDays(1).iso).toBe('2028-02-29');
    expect(parse('2027-02-28').addDays(1).iso).toBe('2027-03-01');
    expect(parse('2026-11-13').addDays(0).iso).toBe('2026-11-13');
  });

  it('compara en orden cronológico', () => {
    expect(parse('2026-11-13').compare(parse('2027-01-09'))).toBeLessThan(0);
    expect(parse('2027-01-09').compare(parse('2026-11-13'))).toBeGreaterThan(0);
    expect(parse('2026-11-13').compare(parse('2026-11-13'))).toBe(0);
  });

  it('isSameMonth mira mes y año', () => {
    expect(parse('2026-11-01').isSameMonth(parse('2026-11-30'))).toBe(true);
    expect(parse('2026-11-01').isSameMonth(parse('2027-11-01'))).toBe(false);
  });

  it('formatea en es-AR', () => {
    const date = parse('2026-11-13');
    expect(date.dayMonthLabel()).toBe('13 de noviembre');
    expect(date.dayMonthLabel(true)).toBe('13 de noviembre de 2026');
    expect(date.shortMonthLabel()).toBe('nov');
    expect(date.monthYearLabel()).toBe('Noviembre 2026');
    expect(parse('2027-01-09').monthYearLabel()).toBe('Enero 2027');
  });

  describe('rangeLabelTo', () => {
    it('mismo día: una sola fecha', () => {
      expect(parse('2026-11-13').rangeLabelTo(parse('2026-11-13'))).toBe('13 de noviembre');
    });

    it('mismo mes: el mes una sola vez', () => {
      expect(parse('2026-11-13').rangeLabelTo(parse('2026-11-16'))).toBe('13 al 16 de noviembre');
    });

    it('cruza de mes: los dos meses, sin año', () => {
      expect(parse('2026-11-28').rangeLabelTo(parse('2026-12-01'))).toBe(
        '28 de noviembre al 1 de diciembre',
      );
    });

    it('cruza de año: con los dos años', () => {
      expect(parse('2026-12-30').rangeLabelTo(parse('2027-01-02'))).toBe(
        '30 de diciembre de 2026 al 2 de enero de 2027',
      );
    });

    it('el mismo mes de otro año no se confunde con el mismo mes', () => {
      expect(parse('2026-11-13').rangeLabelTo(parse('2027-11-16'))).toBe(
        '13 de noviembre de 2026 al 16 de noviembre de 2027',
      );
    });

    it('tira si el rango está al revés', () => {
      expect(() => parse('2026-11-16').rangeLabelTo(parse('2026-11-13'))).toThrow(
        'antes de empezar',
      );
    });
  });

  it('tira con formatos que no son AAAA-MM-DD', () => {
    for (const iso of ['', '13/11/2026', '2026-11-13T00:00:00Z', '2026-1-3', ' 2026-11-13']) {
      expect(() => parse(iso)).toThrow("La fecha tiene que ser una fecha 'AAAA-MM-DD'");
    }
  });

  it('tira con días que no existen', () => {
    expect(() => parse('2026-02-30')).toThrow('no es un día que exista');
    expect(() => parse('2027-02-29')).toThrow('no es un día que exista');
    expect(() => parse('2026-13-01')).toThrow('no es un día que exista');
    expect(() => parse('2026-11-00')).toThrow('no es un día que exista');
    expect(parse('2028-02-29').iso).toBe('2028-02-29');
  });
});
