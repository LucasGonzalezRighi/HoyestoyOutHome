import { toPhoto } from '@/content/records/photos';
import type { TripFitRecord, TripRecord, TripStatsRecord } from '@/content/records/schema';
import { ItineraryDay, Metric, ServiceChecklist, type Departure, type Trip } from '@/domain';

import {
  OVERVIEW_COPY,
  tripChecklist,
  tripClosing,
  tripCover,
  tripDepartures,
  tripMeals,
  tripMeta,
  tripSchedule,
} from './common';
import { tripMetrics } from './tripMetrics';
import type { TripDetailContent, TripFitContent } from './types';

/** Bajadas de las stats automáticas que no cambian de un viaje a otro. */
const AUTO_METRIC_LABELS = {
  distance: 'Distancia total',
  days: 'De travesía',
  summit: 'Cumbre más alta',
} as const;

/**
 * Las stats de "Sobre el viaje": las automáticas salen del catálogo
 * (`tripMetrics`); las personalizadas, de lo que se cargó en el panel.
 */
function overviewStats(trip: Trip, stats: TripStatsRecord): readonly Metric[] {
  return stats.mode === 'auto'
    ? tripMetrics(trip, { ...AUTO_METRIC_LABELS, nights: stats.nightsLabel })
    : stats.items.map((item) => new Metric(item));
}

/** "¿Puedo?" / "¿Es para mí?" con los títulos de la plantilla (`dc.html:182-209`). */
function tripFit(fit: TripFitRecord): TripFitContent {
  return {
    requirements: { title: '¿Puedo?', lead: fit.requirementsLead, facts: fit.facts },
    audience: {
      title: '¿Es para mí?',
      lead: fit.audienceLead,
      ideal: { title: 'Ideal si:', items: fit.ideal },
      approach: { title: 'Trabajamos con:', items: fit.approach },
    },
  };
}

/**
 * Arma todo el contenido de la página de un viaje (`/viajes/<slug>`) a partir
 * del viaje del catálogo y de lo que se cargó en el panel para ese viaje.
 *
 * Los bloques opcionales ("¿Puedo?", qué incluye, pensión) se omiten si el
 * viaje no los tiene, y sin días de itinerario la página muestra
 * "Itinerario próximamente": un viaje recién creado ya tiene una página
 * correcta con solo los datos del catálogo.
 *
 * @param trip El viaje del catálogo (`toTrip(record)`).
 * @param record Lo guardado para ese viaje.
 * @param departures Sus próximas salidas (`schedule.forTrip(slug)`).
 */
export function buildTripDetail(
  trip: Trip,
  record: TripRecord,
  departures: readonly Departure[],
): TripDetailContent {
  const { cover, overview, fit, checklist, meals } = record;
  return {
    meta: tripMeta(trip, record.description),
    cover: tripCover(trip, {
      eyebrow: cover.eyebrow,
      title: cover.titleAccent
        ? { accent: cover.titleAccent, rest: cover.titleRest }
        : { rest: cover.titleRest },
      ...(cover.subtitle ? { subtitle: cover.subtitle } : {}),
    }),
    overview: {
      title: OVERVIEW_COPY.title,
      paragraphs: overview.paragraphs,
      ...(overview.highlight ? { highlight: overview.highlight } : {}),
      ...(overview.modality ? { modality: overview.modality } : {}),
      stats: { label: OVERVIEW_COPY.statsLabel, items: overviewStats(trip, record.stats) },
    },
    schedule: tripSchedule(
      trip,
      record.itinerary.map(
        ({ photo, ...day }) =>
          new ItineraryDay({ ...day, ...(photo ? { photo: toPhoto(photo) } : {}) }),
      ),
    ),
    ...(fit ? { fit: tripFit(fit) } : {}),
    ...(checklist ? { checklist: tripChecklist(new ServiceChecklist(checklist)) } : {}),
    ...(meals ? { meals: tripMeals(meals.footnote) } : {}),
    departures: tripDepartures(departures),
    closing: tripClosing(trip),
  };
}
