import { toPhoto } from '@/content/records/photos';
import type { TripRecord } from '@/content/records/schema';
import { Price, Trip, TripCatalog, TripDuration } from '@/domain';

/**
 * Pasa un viaje guardado a la entidad del dominio: lo que leen la card del
 * home, la página del viaje y el calendario. Tira si el dato rompe una
 * invariante del dominio (el panel lo valida antes de guardar).
 *
 * El precio no se muestra en el sitio (pedido del cliente), pero el dominio lo
 * conserva: sin monto cargado, queda "a consultar".
 */
export function toTrip(record: TripRecord): Trip {
  return new Trip({
    slug: record.slug,
    name: record.name,
    shortName: record.shortName,
    destination: record.destination,
    duration: new TripDuration(record.days, record.nights),
    difficulty: record.difficulty,
    distanceKm: record.distanceKm,
    price: record.priceArs === undefined ? Price.onRequest() : Price.of(record.priceArs),
    photo: toPhoto(record.photo),
    ...(record.summitElevationM === undefined ? {} : { summitElevationM: record.summitElevationM }),
  });
}

/**
 * El catálogo de viajes: los viajes **visibles** del contenido guardado, en el
 * orden en que se guardaron (el del abanico del home). Un viaje oculto no
 * tiene card, ni salidas en el calendario, ni página.
 *
 * Todos los viajes tienen página propia (`/viajes/<slug>`): la ruta la arma
 * `tripPath(trip.slug)` de `constants/routes.ts`, no el catálogo.
 */
export function buildTripCatalog(records: readonly TripRecord[]): TripCatalog {
  return new TripCatalog(records.filter((record) => record.visible).map(toTrip));
}

/**
 * Los tipos para leer el catálogo desde un slice sin ir a buscarlos al
 * dominio: `(slug: TripSlug) => catalog.get(slug)`.
 */
export type { Trip, TripCatalog, TripSlug } from '@/domain';
