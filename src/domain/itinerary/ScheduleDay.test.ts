import { describe, expect, it } from 'vitest';

import { ScheduleDay } from './ScheduleDay';

const firstDay = new ScheduleDay({
  day: 1,
  title: 'Mendoza – Refugio',
  description: 'Primera jornada de trekking.',
  distanceKm: 4,
  elevationGainM: 280,
  walkingHours: 2,
});

describe('ScheduleDay', () => {
  it('arma los tags del día en el orden del diseño', () => {
    expect(firstDay.hasStats).toBe(true);
    expect(firstDay.statLabels()).toEqual(['4 km', '280 m desnivel', '2 hs de marcha']);
  });

  it('agrupa miles del desnivel en es-AR', () => {
    const summitDay = new ScheduleDay({
      day: 3,
      title: 'Cumbres Adolfo Calle y Stepanek',
      description: 'Tercera jornada.',
      distanceKm: 13,
      elevationGainM: 1400,
      walkingHours: 5,
    });
    expect(summitDay.statLabels()).toEqual(['13 km', '1.400 m desnivel', '5 hs de marcha']);
  });

  it('usa "h" en singular para una sola hora de marcha', () => {
    const shortDay = new ScheduleDay({ day: 2, title: 'Corta', description: 'x', walkingHours: 1 });
    expect(shortDay.statLabels()).toEqual(['1 h de marcha']);
  });

  it('el día de regreso no tiene stats', () => {
    const lastDay = new ScheduleDay({
      day: 4,
      title: 'Retorno a Mendoza',
      description: 'Transfer.',
    });
    expect(lastDay.hasStats).toBe(false);
    expect(lastDay.statLabels()).toEqual([]);
  });

  it('dayLabel es el número del círculo', () => {
    expect(firstDay.dayLabel()).toBe('1');
  });

  it('tira con días fuera de rango, textos en blanco o stats no positivas', () => {
    expect(() => new ScheduleDay({ day: 0, title: 'x', description: 'x' })).toThrow(
      'mayor o igual a 1',
    );
    expect(() => new ScheduleDay({ day: 1, title: ' ', description: 'x' })).toThrow(
      'El título del día 1',
    );
    expect(() => new ScheduleDay({ day: 1, title: 'x', description: 'x', distanceKm: -4 })).toThrow(
      'La distancia del día 1',
    );
  });
});
