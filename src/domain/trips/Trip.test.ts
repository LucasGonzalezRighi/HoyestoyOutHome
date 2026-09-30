import { describe, expect, it } from 'vitest';

import { WhatsAppLink } from '../contact/WhatsAppLink';
import { Price } from '../shared/Price';

import { isTripSlug, type TripSlug } from './Trip';
import { buildTrip } from './Trip.fixture';

const whatsapp = new WhatsAppLink('541153347012', 'Hola!');

describe('Trip', () => {
  it('expone sus datos y los formatea', () => {
    const trip = buildTrip();
    expect(trip.slug).toBe('calle-stepanek');
    expect(trip.distanceLabel()).toBe('24 km');
    expect(trip.difficultyLabel()).toBe('Dificultad media');
    expect(trip.duration.label()).toBe('4 días / 3 noches');
    expect(trip.price.label()).toBe('$690.000');
  });

  it('con sección propia, el botón lleva a su ancla en la misma pestaña', () => {
    const trip = buildTrip();
    expect(trip.hasDetail).toBe(true);
    expect(trip.callToAction(whatsapp)).toEqual({
      kind: 'detail',
      href: '#calle',
      external: false,
    });
  });

  it('sin sección propia, el botón abre el chat de WhatsApp sin mensaje', () => {
    const trip = buildTrip({
      slug: 'laguna-negra',
      detailAnchor: undefined,
      price: Price.onRequest(),
    });
    expect(trip.hasDetail).toBe(false);
    expect(trip.callToAction(whatsapp)).toEqual({
      kind: 'inquiry',
      href: 'https://wa.me/541153347012',
      external: true,
    });
  });

  it('tira con textos en blanco, distancia no positiva o ancla mal formada', () => {
    expect(() => buildTrip({ name: ' ' })).toThrow('El nombre del viaje "calle-stepanek"');
    expect(() => buildTrip({ destination: '' })).toThrow('El destino');
    expect(() => buildTrip({ distanceKm: 0 })).toThrow('La distancia');
    expect(() => buildTrip({ detailAnchor: 'calle' })).toThrow('anchorTo()');
  });

  it('tira con slugs o dificultades que llegan sin tipar', () => {
    expect(() => buildTrip({ slug: 'aconcagua' as TripSlug })).toThrow('TRIP_SLUGS');
    expect(() => buildTrip({ difficulty: 'extrema' as 'alta' })).toThrow('La dificultad');
  });

  it('la guarda de slug reconoce solo los del catálogo', () => {
    expect(isTripSlug('lolog')).toBe(true);
    expect(isTripSlug('aconcagua')).toBe(false);
  });
});
