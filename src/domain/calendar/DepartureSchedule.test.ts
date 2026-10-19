import { describe, expect, it } from 'vitest';

import { buildTrip } from '../trips/Trip.fixture';
import { TripDuration } from '../trips/TripDuration';

import { Departure } from './Departure';
import { DepartureSchedule } from './DepartureSchedule';

const calle = buildTrip();
const lolog = buildTrip({ slug: 'lago-lolog-laguna-verde', summitElevationM: undefined });
const lagunaNegra = buildTrip({ slug: 'laguna-negra', duration: new TripDuration(2, 1) });

const calleMarch = new Departure({ trip: calle, startsOn: '2027-03-12' });
const calleNovember = new Departure({ trip: calle, startsOn: '2026-11-13' });
const lologDecember = new Departure({ trip: lolog, startsOn: '2026-12-05' });
const lagunaNegraJanuary = new Departure({ trip: lagunaNegra, startsOn: '2027-01-09' });
const lologLateNovember = new Departure({ trip: lolog, startsOn: '2026-11-28' });

// Cargadas desordenadas a propósito.
const schedule = new DepartureSchedule([
  calleMarch,
  lologDecember,
  calleNovember,
  lagunaNegraJanuary,
  lologLateNovember,
]);

describe('DepartureSchedule', () => {
  it('all() devuelve las salidas en orden cronológico', () => {
    expect(schedule.all()).toEqual([
      calleNovember,
      lologLateNovember,
      lologDecember,
      lagunaNegraJanuary,
      calleMarch,
    ]);
    expect(schedule.size).toBe(5);
  });

  it('la lista no se puede modificar desde afuera', () => {
    expect(Object.isFrozen(schedule.all())).toBe(true);
  });

  it('dos viajes que salen el mismo día quedan en el orden en que se cargaron', () => {
    const sameDayCalle = new Departure({ trip: calle, startsOn: '2026-12-05' });
    const sameDay = new DepartureSchedule([lologDecember, sameDayCalle]);
    expect(sameDay.all()).toEqual([lologDecember, sameDayCalle]);
  });

  it('forTrip devuelve solo las de ese viaje, en orden', () => {
    expect(schedule.forTrip('calle-stepanek')).toEqual([calleNovember, calleMarch]);
    expect(schedule.forTrip('cajon-del-azul')).toEqual([]);
    expect(Object.isFrozen(schedule.forTrip('calle-stepanek'))).toBe(true);
  });

  it('byMonth agrupa por el mes de salida, con los meses en orden', () => {
    const months = schedule.byMonth();
    expect(months.map(({ key, label }) => ({ key, label }))).toEqual([
      { key: '2026-11', label: 'Noviembre 2026' },
      { key: '2026-12', label: 'Diciembre 2026' },
      { key: '2027-01', label: 'Enero 2027' },
      { key: '2027-03', label: 'Marzo 2027' },
    ]);
    expect(months[0]?.departures).toEqual([calleNovember, lologLateNovember]);
    expect(months[3]?.departures).toEqual([calleMarch]);
  });

  it('una salida que cruza de mes va en el mes en que arranca', () => {
    const crossing = new Departure({ trip: calle, startsOn: '2026-11-28' });
    expect(crossing.endsOn).toBe('2026-12-01');
    const months = new DepartureSchedule([crossing]).byMonth();
    expect(months).toHaveLength(1);
    expect(months[0]?.key).toBe('2026-11');
  });

  it('los grupos de byMonth no se pueden modificar desde afuera', () => {
    const months = schedule.byMonth();
    expect(Object.isFrozen(months)).toBe(true);
    expect(Object.isFrozen(months[0])).toBe(true);
    expect(Object.isFrozen(months[0]?.departures)).toBe(true);
  });

  it('sin salidas, todo vacío', () => {
    const empty = new DepartureSchedule([]);
    expect(empty.size).toBe(0);
    expect(empty.all()).toEqual([]);
    expect(empty.byMonth()).toEqual([]);
  });

  it('tira si el mismo viaje sale dos veces el mismo día', () => {
    const duplicate = new Departure({ trip: calle, startsOn: '2026-11-13' });
    expect(() => new DepartureSchedule([calleNovember, duplicate])).toThrow(
      'La salida de "calle-stepanek" del 2026-11-13 está repetida',
    );
  });

  it('el mismo viaje en dos fechas no es un duplicado', () => {
    expect(() => new DepartureSchedule([calleNovember, calleMarch])).not.toThrow();
  });
});
