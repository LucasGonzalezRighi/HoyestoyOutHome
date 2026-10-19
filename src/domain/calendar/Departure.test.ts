import { afterEach, describe, expect, it } from 'vitest';

import { buildTrip } from '../trips/Trip.fixture';
import { TripDuration } from '../trips/TripDuration';

import { Departure } from './Departure';

/** Calle & Stepanek: 4 días, 3 noches. */
const calle = buildTrip();
/** Laguna Negra: 2 días, 1 noche. */
const lagunaNegra = buildTrip({ slug: 'laguna-negra', duration: new TripDuration(2, 1) });

describe('Departure', () => {
  it('el fin sale de la duración del viaje, contando el día de salida', () => {
    const departure = new Departure({ trip: calle, startsOn: '2026-11-13' });
    expect(departure.trip).toBe(calle);
    expect(departure.startsOn).toBe('2026-11-13');
    expect(departure.endsOn).toBe('2026-11-16');
    expect(new Departure({ trip: lagunaNegra, startsOn: '2027-01-09' }).endsOn).toBe('2027-01-10');
  });

  it('id junta viaje y fecha', () => {
    expect(new Departure({ trip: calle, startsOn: '2026-11-13' }).id).toBe(
      'calle-stepanek-2026-11-13',
    );
  });

  describe('rangeLabel', () => {
    it('mismo mes: "13 al 16 de noviembre"', () => {
      expect(new Departure({ trip: calle, startsOn: '2026-11-13' }).rangeLabel()).toBe(
        '13 al 16 de noviembre',
      );
    });

    it('cruza de mes: los dos meses', () => {
      const departure = new Departure({ trip: calle, startsOn: '2026-11-28' });
      expect(departure.endsOn).toBe('2026-12-01');
      expect(departure.rangeLabel()).toBe('28 de noviembre al 1 de diciembre');
    });

    it('cruza de año: con año', () => {
      const departure = new Departure({ trip: calle, startsOn: '2026-12-30' });
      expect(departure.endsOn).toBe('2027-01-02');
      expect(departure.rangeLabel()).toBe('30 de diciembre de 2026 al 2 de enero de 2027');
    });

    it('cruza el 29 de febrero de un año bisiesto', () => {
      const departure = new Departure({ trip: calle, startsOn: '2028-02-27' });
      expect(departure.endsOn).toBe('2028-03-01');
      expect(departure.rangeLabel()).toBe('27 de febrero al 1 de marzo');
    });

    it('un viaje de un día: una sola fecha', () => {
      const dayTrip = buildTrip({ duration: new TripDuration(1, 0) });
      const departure = new Departure({ trip: dayTrip, startsOn: '2026-11-13' });
      expect(departure.endsOn).toBe('2026-11-13');
      expect(departure.rangeLabel()).toBe('13 de noviembre');
    });
  });

  it('marcador, mes y clave del mes salen del día de salida', () => {
    const departure = new Departure({ trip: calle, startsOn: '2026-11-28' });
    expect(departure.marker()).toEqual({ day: '28', month: 'nov' });
    expect(departure.startLabel()).toBe('28 de noviembre');
    expect(departure.monthLabel()).toBe('Noviembre 2026');
    expect(departure.monthKey()).toBe('2026-11');
  });

  it('el día del marcador va sin cero adelante', () => {
    expect(new Departure({ trip: calle, startsOn: '2027-03-05' }).marker()).toEqual({
      day: '5',
      month: 'mar',
    });
  });

  it('compareTo ordena por día de salida', () => {
    const november = new Departure({ trip: calle, startsOn: '2026-11-13' });
    const january = new Departure({ trip: lagunaNegra, startsOn: '2027-01-09' });
    expect(november.compareTo(january)).toBeLessThan(0);
    expect(january.compareTo(november)).toBeGreaterThan(0);
    expect(november.compareTo(new Departure({ trip: lagunaNegra, startsOn: '2026-11-13' }))).toBe(
      0,
    );
  });

  it('tira con fechas mal formadas o que no existen, nombrando el viaje', () => {
    expect(() => new Departure({ trip: calle, startsOn: '13/11/2026' })).toThrow(
      'La fecha de salida de "calle-stepanek"',
    );
    expect(() => new Departure({ trip: calle, startsOn: '2026-02-30' })).toThrow(
      'no es un día que exista',
    );
  });

  it('tira si el viaje dura 0 días', () => {
    const noDays = buildTrip({ duration: new TripDuration(0, 0) });
    expect(() => new Departure({ trip: noDays, startsOn: '2026-11-13' })).toThrow('al menos uno');
  });

  describe('husos horarios', () => {
    const originalTz = process.env.TZ;

    afterEach(() => {
      if (originalTz === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTz;
      }
    });

    it('cambiar TZ en el test tiene efecto (si no, los casos de abajo no prueban nada)', () => {
      // Medianoche UTC del 13 es todavía el 12 a las 21 en Buenos Aires: el
      // corrimiento que el dominio evita al no usar nunca la hora local.
      process.env.TZ = 'America/Argentina/Buenos_Aires';
      const utcMidnight = new Date(Date.UTC(2026, 10, 13));
      expect(utcMidnight.getTimezoneOffset()).toBe(180);
      expect(utcMidnight.getDate()).toBe(12);
      process.env.TZ = 'UTC';
      expect(utcMidnight.getTimezoneOffset()).toBe(0);
      expect(utcMidnight.getDate()).toBe(13);
    });

    it.each([
      'America/Argentina/Buenos_Aires',
      'UTC',
      // Los extremos: UTC+14 y UTC−11.
      'Pacific/Kiritimati',
      'Pacific/Pago_Pago',
    ])('con TZ=%s la fecha no se corre', (timeZone) => {
      process.env.TZ = timeZone;
      const departure = new Departure({ trip: calle, startsOn: '2026-11-13' });
      expect(departure.startsOn).toBe('2026-11-13');
      expect(departure.endsOn).toBe('2026-11-16');
      expect(departure.rangeLabel()).toBe('13 al 16 de noviembre');
      expect(departure.marker()).toEqual({ day: '13', month: 'nov' });
      expect(departure.monthKey()).toBe('2026-11');
      expect(departure.monthLabel()).toBe('Noviembre 2026');

      const newYear = new Departure({ trip: calle, startsOn: '2027-01-01' });
      expect(newYear.monthLabel()).toBe('Enero 2027');
      expect(newYear.marker()).toEqual({ day: '1', month: 'ene' });
    });
  });
});
