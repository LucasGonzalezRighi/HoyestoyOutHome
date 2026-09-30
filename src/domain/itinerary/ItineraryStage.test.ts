import { describe, expect, it } from 'vitest';

import { Photo } from '../shared/Photo';

import { ItineraryStage, type ItineraryStageParams } from './ItineraryStage';

const photo = new Photo({
  src: '/images/photos/lolog.jpg',
  alt: 'Bosque',
  width: 1400,
  height: 933,
});

const secondDay: ItineraryStageParams = {
  day: 2,
  route: 'Auquinco – Rincón de los Pinos',
  paragraphs: ['Desde el Portezuelo de Auquinco…', 'Sobre el final…'],
  photo,
  distanceKm: 11.3,
  elevationGainM: 310,
};

describe('ItineraryStage', () => {
  it('formatea el día y las métricas en es-AR', () => {
    const stage = new ItineraryStage({ ...secondDay, day: 1, distanceKm: 12, elevationGainM: 570 });
    expect(stage.dayLabel()).toBe('Día 1');
    expect(stage.hasMetrics).toBe(true);
    expect(stage.distanceLabel()).toBe('12 km');
    expect(stage.elevationLabel()).toBe('+570 m');
  });

  it('usa coma decimal en la distancia', () => {
    expect(new ItineraryStage(secondDay).distanceLabel()).toBe('11,3 km');
  });

  it('el día 0 no tiene métricas y sus labels tiran', () => {
    const meeting = new ItineraryStage({
      day: 0,
      route: 'Encuentro y revisión de equipo',
      paragraphs: ['Encuentro en San Martín de los Andes.'],
      photo,
    });
    expect(meeting.dayLabel()).toBe('Día 0');
    expect(meeting.hasMetrics).toBe(false);
    expect(() => meeting.distanceLabel()).toThrow('no tiene métricas');
    expect(() => meeting.elevationLabel()).toThrow('no tiene métricas');
  });

  it('los párrafos quedan congelados', () => {
    expect(Object.isFrozen(new ItineraryStage(secondDay).paragraphs)).toBe(true);
  });

  it('tira si falta uno de los dos datos de métricas', () => {
    expect(() => new ItineraryStage({ ...secondDay, elevationGainM: undefined })).toThrow(
      'distancia y desnivel juntos',
    );
  });

  it('tira con días negativos, tramo en blanco o sin párrafos', () => {
    expect(() => new ItineraryStage({ ...secondDay, day: -1 })).toThrow('mayor o igual a 0');
    expect(() => new ItineraryStage({ ...secondDay, route: '' })).toThrow('El tramo del día 2');
    expect(() => new ItineraryStage({ ...secondDay, paragraphs: [] })).toThrow(
      'al menos un elemento',
    );
  });
});
