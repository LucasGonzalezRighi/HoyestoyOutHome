import { Photo } from '../shared/Photo';
import { Price } from '../shared/Price';

import { Trip, type TripParams } from './Trip';
import { TripDuration } from './TripDuration';

/**
 * Fábrica de viajes para los tests de `trips/`: un viaje válido por defecto
 * al que cada test le pisa solo lo que le importa. Así un test que prueba la
 * dificultad no depende de acordarse de la foto o el precio.
 */
export function buildTrip(overrides: Partial<TripParams> = {}): Trip {
  return new Trip({
    slug: 'calle-stepanek',
    name: 'Calle & Stepanek — Tu primer 4mil',
    shortName: 'Calle & Stepanek',
    destination: 'Mendoza · Vallecitos',
    duration: new TripDuration(4, 3),
    difficulty: 'media',
    distanceKm: 24,
    price: Price.of(690000),
    photo: new Photo({ src: '/images/photos/calle.jpg', alt: 'Cartel de cumbre' }),
    detailAnchor: '#calle',
    ...overrides,
  });
}
