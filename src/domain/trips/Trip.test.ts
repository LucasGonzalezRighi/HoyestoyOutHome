import { describe, expect, it } from 'vitest';

import { isTripSlug, TRIP_SLUGS, type TripSlug } from './Trip';
import { buildTrip } from './Trip.fixture';

describe('Trip', () => {
  it('expone sus datos y los formatea', () => {
    const trip = buildTrip();
    expect(trip.slug).toBe('calle-stepanek');
    expect(trip.distanceLabel()).toBe('24 km');
    expect(trip.difficultyLabel()).toBe('Dificultad media');
    expect(trip.duration.label()).toBe('4 días / 3 noches');
    expect(trip.price.label()).toBe('$690.000');
  });

  it('con cumbre: la altura agrupa miles en es-AR', () => {
    const trip = buildTrip();
    expect(trip.summitElevationM).toBe(4290);
    expect(trip.summitLabel()).toBe('Cumbre 4.290 m');
  });

  it('sin cumbre: summitLabel es undefined', () => {
    const trip = buildTrip({ slug: 'laguna-negra', summitElevationM: undefined });
    expect(trip.summitElevationM).toBeUndefined();
    expect(trip.summitLabel()).toBeUndefined();
  });

  it('tira con textos en blanco o distancia no positiva', () => {
    expect(() => buildTrip({ name: ' ' })).toThrow('El nombre del viaje "calle-stepanek"');
    expect(() => buildTrip({ shortName: '' })).toThrow('El nombre corto');
    expect(() => buildTrip({ destination: '' })).toThrow('El destino');
    expect(() => buildTrip({ distanceKm: 0 })).toThrow('La distancia');
  });

  it('tira con una cumbre que no es un entero positivo', () => {
    expect(() => buildTrip({ summitElevationM: 0 })).toThrow('La altura de la cumbre');
    expect(() => buildTrip({ summitElevationM: -4290 })).toThrow('La altura de la cumbre');
    expect(() => buildTrip({ summitElevationM: 4290.5 })).toThrow('número entero');
  });

  it('tira con slugs o dificultades que llegan sin tipar', () => {
    expect(() => buildTrip({ slug: 'aconcagua' as TripSlug })).toThrow('TRIP_SLUGS');
    expect(() => buildTrip({ difficulty: 'extrema' as 'alta' })).toThrow('La dificultad');
  });

  it('la guarda de slug reconoce solo los del catálogo', () => {
    expect(isTripSlug('lago-lolog-laguna-verde')).toBe(true);
    expect(isTripSlug('aconcagua')).toBe(false);
  });

  it('los slugs sirven tal cual como tramo de URL: minúsculas, dígitos y guiones', () => {
    for (const slug of TRIP_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});
