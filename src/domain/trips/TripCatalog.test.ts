import { describe, expect, it } from 'vitest';

import { buildTrip } from './Trip.fixture';
import { TripCatalog } from './TripCatalog';

const calle = buildTrip();
const lolog = buildTrip({
  slug: 'lolog',
  name: 'Lago Lolog a Laguna Verde',
  detailAnchor: '#lolog',
});
const catalog = new TripCatalog([calle, lolog]);

describe('TripCatalog', () => {
  it('devuelve los viajes en el orden en que se cargaron', () => {
    expect(catalog.all()).toEqual([calle, lolog]);
    expect(catalog.size).toBe(2);
  });

  it('la lista no se puede modificar desde afuera', () => {
    expect(Object.isFrozen(catalog.all())).toBe(true);
  });

  it('get devuelve el viaje por slug', () => {
    expect(catalog.get('lolog')).toBe(lolog);
  });

  it('get tira si el viaje no está en el catálogo', () => {
    expect(() => catalog.get('laguna-negra')).toThrow(
      'No hay ningún viaje con el slug "laguna-negra" en el catálogo.',
    );
  });

  it('find devuelve undefined en vez de tirar, y acepta strings sin tipar', () => {
    expect(catalog.find('calle-stepanek')).toBe(calle);
    expect(catalog.find('laguna-negra')).toBeUndefined();
    expect(catalog.find('cualquier-cosa')).toBeUndefined();
  });

  it('tira si hay slugs repetidos', () => {
    const duplicate = buildTrip({ slug: 'lolog' });
    expect(() => new TripCatalog([lolog, duplicate])).toThrow('"lolog" está repetido');
  });
});
