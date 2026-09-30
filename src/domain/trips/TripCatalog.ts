import type { Trip, TripSlug } from './Trip';

/**
 * El catálogo de viajes: la lista ordenada (el orden es el de la sección
 * "Próximos viajes") más la búsqueda por slug que usan las secciones de cada
 * viaje (`tripCatalog.get('calle-stepanek').price`).
 *
 * Invariante: no hay dos viajes con el mismo slug. Si los viajes pasan a venir
 * de un CMS, se reemplaza quién arma el catálogo, no esta clase.
 */
export class TripCatalog {
  private readonly trips: readonly Trip[];
  private readonly bySlug: ReadonlyMap<string, Trip>;

  constructor(trips: readonly Trip[]) {
    const bySlug = new Map<string, Trip>();
    for (const trip of trips) {
      if (bySlug.has(trip.slug)) {
        throw new Error(`El slug "${trip.slug}" está repetido en el catálogo de viajes.`);
      }
      bySlug.set(trip.slug, trip);
    }
    this.trips = Object.freeze([...trips]);
    this.bySlug = bySlug;
  }

  /** Cantidad de viajes. */
  get size(): number {
    return this.trips.length;
  }

  /** Todos los viajes, en el orden en que se muestran. */
  all(): readonly Trip[] {
    return this.trips;
  }

  /** El viaje con ese slug. Tira si no está: pedir un viaje que no existe es un bug del contenido. */
  get(slug: TripSlug): Trip {
    const trip = this.bySlug.get(slug);
    if (!trip) {
      throw new Error(`No hay ningún viaje con el slug "${slug}" en el catálogo.`);
    }
    return trip;
  }

  /**
   * Como `get`, pero devuelve `undefined` en vez de tirar. Acepta cualquier
   * string para poder consultar datos sin tipar (un parámetro de URL, un CMS).
   */
  find(slug: string): Trip | undefined {
    return this.bySlug.get(slug);
  }
}
