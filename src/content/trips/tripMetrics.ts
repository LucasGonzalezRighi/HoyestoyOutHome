import { Metric, type Trip } from '@/domain';

/** Las bajadas de cada stat ("Distancia total", "De travesía"…). Son copy de cada viaje. */
export type TripMetricLabels = {
  /** Bajada de la distancia: "Distancia total". */
  readonly distance: string;
  /** Bajada de los días: "De travesía". */
  readonly days: string;
  /** Bajada de las noches: "En refugio", "En la montaña". */
  readonly nights: string;
  /** Bajada de la cumbre: "Cumbre más alta". Solo se usa si el viaje tiene cumbre. */
  readonly summit: string;
};

/** Sufijo singular y plural de una unidad que se cuenta: `[' día', ' días']`. */
type CountSuffix = readonly [singular: string, plural: string];

/** Unidades de las stats, con su espacio adelante (`Metric` pega el sufijo tal cual). */
const SUFFIXES = {
  kilometers: ' km',
  meters: ' m',
  days: [' día', ' días'],
  nights: [' noche', ' noches'],
} as const satisfies Record<string, string | CountSuffix>;

/** El sufijo que corresponde a la cantidad: en español, singular solo para 1. */
function countSuffix(count: number, [singular, plural]: CountSuffix): string {
  return count === 1 ? singular : plural;
}

/**
 * Las stats con contador de la presentación de un viaje, sacadas del catálogo:
 * distancia, días, noches (si duerme afuera) y cumbre (si tiene).
 *
 * Existe para que las stats no repitan a mano lo que ya dice el catálogo: si
 * cambia la distancia o la duración de un viaje, cambian también la card del
 * carrusel, los tags de la portada y estas stats. Lago Lolog no la usa porque
 * sus stats son otras (desnivel acumulado), escritas en su archivo.
 *
 * La distancia del catálogo tiene que ser entera: `Metric` solo acepta enteros
 * (el contador anima enteros) y tira con un decimal.
 *
 * @example tripMetrics(calle, labels).map((metric) => metric.format())
 *   // → ['24 km', '4 días', '3 noches', '4.290 m']
 */
export function tripMetrics(trip: Trip, labels: TripMetricLabels): readonly Metric[] {
  const { days, nights } = trip.duration;
  const metrics = [
    new Metric({ value: trip.distanceKm, suffix: SUFFIXES.kilometers, label: labels.distance }),
    new Metric({ value: days, suffix: countSuffix(days, SUFFIXES.days), label: labels.days }),
  ];
  if (nights > 0) {
    metrics.push(
      new Metric({
        value: nights,
        suffix: countSuffix(nights, SUFFIXES.nights),
        label: labels.nights,
      }),
    );
  }
  if (trip.summitElevationM !== undefined) {
    metrics.push(
      new Metric({ value: trip.summitElevationM, suffix: SUFFIXES.meters, label: labels.summit }),
    );
  }
  return metrics;
}
