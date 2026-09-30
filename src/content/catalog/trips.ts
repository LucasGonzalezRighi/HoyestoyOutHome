import { anchorTo } from '@/constants/sections';
import { PHOTOS } from '@/content/media';
import { Price, Trip, TripCatalog, TripDuration } from '@/domain';

/**
 * El catálogo de viajes: los cuatro del diseño (array `trips` del script de
 * `docs/design/hoy-estoy-ooh-landing.dc.html`), en el orden de la sección
 * "Próximos viajes".
 *
 * Es la única fuente de datos de cada viaje: la card, la sección propia y el
 * cierre leen de acá (`tripCatalog.get('calle-stepanek').price`), así un
 * precio o una distancia se cambia en un solo lugar.
 *
 * Los que tienen sección propia llevan `detailAnchor`; el resto se consulta
 * por WhatsApp (`trip.callToAction(whatsapp)` decide a dónde va el botón).
 */
export const tripCatalog = new TripCatalog([
  new Trip({
    slug: 'calle-stepanek',
    name: 'Calle & Stepanek — Tu primer 4mil',
    shortName: 'Calle & Stepanek',
    destination: 'Mendoza · Vallecitos',
    duration: new TripDuration(4, 3),
    difficulty: 'media',
    distanceKm: 24,
    price: Price.of(690000),
    // La card la encuadra más abajo que la foto sticky de la sección 04 (`pos: 'center 62%'`).
    photo: PHOTOS.calleSummitSign.withPosition('center 62%'),
    detailAnchor: anchorTo('calleStepanek'),
  }),
  new Trip({
    slug: 'lolog',
    name: 'Lago Lolog a Laguna Verde',
    shortName: 'Lago Lolog',
    destination: 'Neuquén · Huella Andina',
    duration: new TripDuration(4, 3),
    difficulty: 'media',
    distanceKm: 44,
    price: Price.onRequest(),
    photo: PHOTOS.volcanicPlain,
    detailAnchor: anchorTo('lolog'),
  }),
  new Trip({
    slug: 'laguna-negra',
    name: 'Laguna Negra',
    shortName: 'Laguna Negra',
    destination: 'Bariloche',
    duration: new TripDuration(2, 1),
    difficulty: 'media',
    distanceKm: 18,
    price: Price.onRequest(),
    photo: PHOTOS.refugeUnderStars,
  }),
  new Trip({
    slug: 'cajon-del-azul',
    name: 'Cajón del Azul y Hielo Azul',
    shortName: 'Cajón del Azul',
    destination: 'El Bolsón',
    duration: new TripDuration(3, 2),
    difficulty: 'media',
    distanceKm: 26,
    price: Price.onRequest(),
    photo: PHOTOS.riverCrossing,
  }),
]);

/**
 * Los tipos para leer el catálogo desde un slice sin ir a buscarlos al
 * dominio: `(slug: TripSlug) => tripCatalog.get(slug)`.
 */
export type { Trip, TripCallToAction, TripSlug } from '@/domain';
