import { describe, expect, it } from 'vitest';

import { tripCatalog } from '@/content/catalog/trips';
import { PHOTOS } from '@/content/media';
import { Price, Trip, TripDuration } from '@/domain';

import { tripMetrics, type TripMetricLabels } from './tripMetrics';

const LABELS: TripMetricLabels = {
  distance: 'Distancia total',
  days: 'De travesía',
  nights: 'En refugio',
  summit: 'Cumbre más alta',
};

/** Un viaje de un día, sin noche afuera ni cumbre. */
const dayHike = new Trip({
  slug: 'laguna-negra',
  name: 'Salida de un día',
  shortName: 'Salida de un día',
  destination: 'Bariloche',
  duration: new TripDuration(1, 0),
  difficulty: 'media',
  distanceKm: 12,
  price: Price.onRequest(),
  photo: PHOTOS.refugeUnderStars,
});

describe('tripMetrics', () => {
  it('saca distancia, días, noches y cumbre del catálogo (Calle & Stepanek)', () => {
    const metrics = tripMetrics(tripCatalog.get('calle-stepanek'), LABELS);
    expect(metrics.map((metric) => metric.format())).toEqual([
      '24 km',
      '4 días',
      '3 noches',
      '4.290 m',
    ]);
    expect(metrics.map((metric) => metric.label)).toEqual([
      'Distancia total',
      'De travesía',
      'En refugio',
      'Cumbre más alta',
    ]);
  });

  it('omite la cumbre si el viaje no tiene, y usa el singular para 1 noche', () => {
    const metrics = tripMetrics(tripCatalog.get('laguna-negra'), LABELS);
    expect(metrics.map((metric) => metric.format())).toEqual(['18 km', '2 días', '1 noche']);
  });

  it('omite las noches si el viaje no duerme afuera', () => {
    const metrics = tripMetrics(dayHike, LABELS);
    expect(metrics.map((metric) => metric.format())).toEqual(['12 km', '1 día']);
  });

  it('guarda el número sin formato, que es lo que anima el contador', () => {
    const metrics = tripMetrics(tripCatalog.get('calle-stepanek'), LABELS);
    expect(metrics.map((metric) => metric.value)).toEqual([24, 4, 3, 4290]);
  });
});
