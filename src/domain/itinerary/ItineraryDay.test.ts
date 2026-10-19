import { describe, expect, it } from 'vitest';

import { Photo } from '../shared/Photo';

import { ItineraryDay, type ItineraryDayParams } from './ItineraryDay';

const photo = new Photo({
  src: '/images/photos/lolog.jpg',
  alt: 'Bosque',
  width: 1400,
  height: 933,
});

/** Un día de Calle & Stepanek: sin foto, con las tres stats. */
const calleFirstDay: ItineraryDayParams = {
  day: 1,
  title: 'Mendoza – Refugio',
  paragraphs: ['Primera jornada de trekking.'],
  distanceKm: 4,
  elevationGainM: 280,
  walkingHours: 2,
};

/** Un día de Lolog: con foto, distancia y desnivel, sin horas de marcha. */
const lologSecondDay: ItineraryDayParams = {
  day: 2,
  title: 'Auquinco – Rincón de los Pinos',
  paragraphs: ['Desde el Portezuelo de Auquinco…', 'Sobre el final…'],
  photo,
  distanceKm: 11.3,
  elevationGainM: 310,
};

describe('ItineraryDay', () => {
  it('expone sus datos', () => {
    const day = new ItineraryDay(lologSecondDay);
    expect(day.day).toBe(2);
    expect(day.title).toBe('Auquinco – Rincón de los Pinos');
    expect(day.paragraphs).toEqual(['Desde el Portezuelo de Auquinco…', 'Sobre el final…']);
    expect(day.photo).toBe(photo);
    expect(day.distanceKm).toBe(11.3);
    expect(day.elevationGainM).toBe(310);
    expect(day.walkingHours).toBeUndefined();
  });

  it('marcador y etiqueta del día, también para el día 0', () => {
    expect(new ItineraryDay(calleFirstDay).markerLabel()).toBe('1');
    expect(new ItineraryDay(calleFirstDay).dayLabel()).toBe('Día 1');
    const meeting = new ItineraryDay({ day: 0, title: 'Encuentro', paragraphs: ['Encuentro.'] });
    expect(meeting.markerLabel()).toBe('0');
    expect(meeting.dayLabel()).toBe('Día 0');
  });

  it('hasPhoto dice si el día trae foto', () => {
    expect(new ItineraryDay(lologSecondDay).hasPhoto).toBe(true);
    expect(new ItineraryDay(calleFirstDay).hasPhoto).toBe(false);
    expect(new ItineraryDay(calleFirstDay).photo).toBeUndefined();
  });

  describe('tags que se explican solos (statLabels)', () => {
    it('van en el orden del diseño: distancia, desnivel, marcha', () => {
      expect(new ItineraryDay(calleFirstDay).statLabels()).toEqual([
        '4 km',
        '280 m desnivel',
        '2 hs de marcha',
      ]);
    });

    it('agrupan miles del desnivel en es-AR', () => {
      const summitDay = new ItineraryDay({
        ...calleFirstDay,
        day: 3,
        distanceKm: 13,
        elevationGainM: 1400,
        walkingHours: 5,
      });
      expect(summitDay.statLabels()).toEqual(['13 km', '1.400 m desnivel', '5 hs de marcha']);
    });

    it('usan "h" en singular para una sola hora de marcha', () => {
      const shortDay = new ItineraryDay({
        day: 2,
        title: 'Corta',
        paragraphs: ['x'],
        walkingHours: 1,
      });
      expect(shortDay.statLabels()).toEqual(['1 h de marcha']);
    });

    it('incluyen solo las stats que existen', () => {
      expect(new ItineraryDay(lologSecondDay).statLabels()).toEqual(['11,3 km', '310 m desnivel']);
    });
  });

  describe('valores cortos (labels sueltos y stats)', () => {
    it('formatean en es-AR, con coma decimal y + en el desnivel', () => {
      const day = new ItineraryDay(lologSecondDay);
      expect(day.distanceLabel()).toBe('11,3 km');
      expect(day.elevationGainLabel()).toBe('+310 m');
      expect(day.walkingTimeLabel()).toBeUndefined();
      expect(
        new ItineraryDay({ ...lologSecondDay, elevationGainM: 1400 }).elevationGainLabel(),
      ).toBe('+1.400 m');
    });

    it('stats() trae kind y valor, en orden fijo y solo las que existen', () => {
      expect(new ItineraryDay(calleFirstDay).stats()).toEqual([
        { kind: 'distance', value: '4 km' },
        { kind: 'elevationGain', value: '+280 m' },
        { kind: 'walkingTime', value: '2 hs' },
      ]);
      expect(
        new ItineraryDay({
          ...lologSecondDay,
          day: 1,
          distanceKm: 12,
          elevationGainM: 570,
        }).stats(),
      ).toEqual([
        { kind: 'distance', value: '12 km' },
        { kind: 'elevationGain', value: '+570 m' },
      ]);
    });
  });

  it('el día de regreso no tiene stats', () => {
    const lastDay = new ItineraryDay({
      day: 4,
      title: 'Retorno a Mendoza',
      paragraphs: ['Desayuno y transfer a Mendoza.'],
    });
    expect(lastDay.hasStats).toBe(false);
    expect(lastDay.statLabels()).toEqual([]);
    expect(lastDay.stats()).toEqual([]);
    expect(lastDay.distanceLabel()).toBeUndefined();
    expect(lastDay.elevationGainLabel()).toBeUndefined();
  });

  it('con una sola stat ya tiene stats', () => {
    const walkOnly = new ItineraryDay({ day: 1, title: 'x', paragraphs: ['x'], walkingHours: 3 });
    expect(walkOnly.hasStats).toBe(true);
  });

  it('los párrafos quedan congelados y son una copia', () => {
    const paragraphs = ['Uno.', 'Dos.'];
    const day = new ItineraryDay({ ...calleFirstDay, paragraphs });
    expect(Object.isFrozen(day.paragraphs)).toBe(true);
    expect(day.paragraphs).not.toBe(paragraphs);
  });

  it('tira con días negativos o con decimales', () => {
    expect(() => new ItineraryDay({ ...calleFirstDay, day: -1 })).toThrow('mayor o igual a 0');
    expect(() => new ItineraryDay({ ...calleFirstDay, day: 1.5 })).toThrow('número entero');
  });

  it('tira con título en blanco o sin párrafos', () => {
    expect(() => new ItineraryDay({ ...calleFirstDay, title: ' ' })).toThrow('El título del día 1');
    expect(() => new ItineraryDay({ ...calleFirstDay, paragraphs: [] })).toThrow(
      'al menos un elemento',
    );
    expect(() => new ItineraryDay({ ...calleFirstDay, paragraphs: ['ok', ''] })).toThrow(
      'Los párrafos del día 1',
    );
  });

  it('tira con stats que no son positivas', () => {
    expect(() => new ItineraryDay({ ...calleFirstDay, distanceKm: -4 })).toThrow(
      'La distancia del día 1',
    );
    expect(() => new ItineraryDay({ ...calleFirstDay, elevationGainM: 0 })).toThrow(
      'El desnivel del día 1',
    );
    expect(() => new ItineraryDay({ ...calleFirstDay, walkingHours: Number.NaN })).toThrow(
      'Las horas de marcha del día 1',
    );
  });
});
