import type { TripSlug } from '../trips/Trip';

import type { Departure } from './Departure';

/** Las salidas de un mes, para un bloque del calendario. */
export type DepartureMonth = {
  /** Clave del mes, estable y ordenable: `'2026-11'`. Sirve de `key` de React. */
  readonly key: string;
  /** Título del bloque: `"Noviembre 2026"`. */
  readonly label: string;
  /** Las salidas que arrancan ese mes, en orden cronológico. */
  readonly departures: readonly Departure[];
};

/**
 * El calendario de salidas: todas las salidas programadas, en orden
 * cronológico, más las dos vistas que usa el sitio (las de un viaje, para su
 * página, y agrupadas por mes, para el calendario del home).
 *
 * Invariante: no hay dos salidas del mismo viaje el mismo día. El orden es
 * por día de salida; dos viajes que salen el mismo día quedan en el orden en
 * que se cargaron (el `sort` de JS es estable).
 *
 * Una salida que cruza de mes se agrupa en el mes en que arranca.
 */
export class DepartureSchedule {
  private readonly departures: readonly Departure[];

  constructor(departures: readonly Departure[]) {
    const ids = new Set<string>();
    for (const departure of departures) {
      if (ids.has(departure.id)) {
        throw new Error(
          `La salida de "${departure.trip.slug}" del ${departure.startsOn} está repetida en el calendario.`,
        );
      }
      ids.add(departure.id);
    }
    this.departures = Object.freeze([...departures].sort((a, b) => a.compareTo(b)));
  }

  /** Cantidad de salidas. */
  get size(): number {
    return this.departures.length;
  }

  /** Todas las salidas, en orden cronológico. */
  all(): readonly Departure[] {
    return this.departures;
  }

  /** Las salidas de un viaje, en orden cronológico (vacío si no tiene ninguna). */
  forTrip(slug: TripSlug): readonly Departure[] {
    return Object.freeze(this.departures.filter((departure) => departure.trip.slug === slug));
  }

  /**
   * Las salidas agrupadas por el mes en que arrancan, con los meses en orden
   * cronológico. Solo aparecen los meses que tienen salidas.
   */
  byMonth(): readonly DepartureMonth[] {
    const months = new Map<string, { label: string; departures: Departure[] }>();
    for (const departure of this.departures) {
      const key = departure.monthKey();
      const month = months.get(key);
      if (month) {
        month.departures.push(departure);
      } else {
        months.set(key, { label: departure.monthLabel(), departures: [departure] });
      }
    }
    // why: el Map conserva el orden de inserción, y las salidas ya vienen ordenadas.
    return Object.freeze(
      [...months].map(([key, { label, departures }]) =>
        Object.freeze({ key, label, departures: Object.freeze(departures) }),
      ),
    );
  }
}
