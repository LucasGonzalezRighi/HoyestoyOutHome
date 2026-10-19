import { PHOTOS } from '@/content/media';
import { Price, Trip, TripCatalog, TripDuration } from '@/domain';

/**
 * El catálogo de viajes: los cuatro del diseño (array `trips` del script de
 * `docs/design/hoy-estoy-ooh-landing.dc.html`), en el orden del carrusel de
 * viajes del home.
 *
 * Es la única fuente de datos de cada viaje: la card del carrusel, la página
 * del viaje y el calendario leen de acá (`tripCatalog.get('calle-stepanek').price`),
 * así un precio o una distancia se cambia en un solo lugar.
 *
 * Todos los viajes tienen página propia (`/viajes/<slug>`): la ruta la arma
 * `tripPath(trip.slug)` de `constants/routes.ts`, no el catálogo.
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
    // La card la encuadra más abajo que el registro (`pos: 'center 62%'` en el diseño).
    photo: PHOTOS.calleSummitSign.withPosition('center 62%'),
    // El Cerro Adolfo Calle: la altura del cartel de la foto ("4.290 m s.n.m.").
    summitElevationM: 4290,
  }),
  new Trip({
    slug: 'lago-lolog-laguna-verde',
    name: 'Lago Lolog a Laguna Verde',
    shortName: 'Lago Lolog',
    destination: 'Neuquén · Huella Andina',
    duration: new TripDuration(4, 3),
    difficulty: 'media',
    distanceKm: 44,
    price: Price.onRequest(),
    photo: PHOTOS.volcanicPlain,
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
export type { Trip, TripSlug } from '@/domain';
