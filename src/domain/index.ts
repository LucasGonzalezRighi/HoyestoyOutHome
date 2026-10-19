/**
 * API pública del dominio: las clases del negocio de Hoy Estoy Out Of Home.
 *
 * TypeScript puro (sin React ni DOM). Desde afuera se importa solo de acá:
 * `import { Trip, Price } from '@/domain'`. Ver `README.md`.
 */

export { Departure, type DateMarker, type DepartureParams } from './calendar/Departure';
export { DepartureSchedule, type DepartureMonth } from './calendar/DepartureSchedule';

export { WhatsAppLink } from './contact/WhatsAppLink';

export {
  ITINERARY_STAT_KINDS,
  ItineraryDay,
  type ItineraryDayParams,
  type ItineraryStat,
  type ItineraryStatKind,
} from './itinerary/ItineraryDay';

export { Metric, type MetricParams } from './metrics/Metric';

export { Guide, type GuideParams } from './people/Guide';
export { Testimonial, type TestimonialParams } from './people/Testimonial';

export {
  SERVICE_GROUP_KINDS,
  ServiceChecklist,
  type ServiceChecklistParams,
  type ServiceGroup,
  type ServiceGroupKind,
} from './services/ServiceChecklist';

export { formatCount, formatKilometers, formatMeters, formatNumber } from './shared/formatters';
export { Photo, type PhotoParams } from './shared/Photo';
export { Price } from './shared/Price';

export { DIFFICULTIES, difficultyLabel, isDifficulty, type Difficulty } from './trips/Difficulty';
export { TRIP_SLUGS, Trip, isTripSlug, type TripParams, type TripSlug } from './trips/Trip';
export { TripCatalog } from './trips/TripCatalog';
export { TripDuration } from './trips/TripDuration';
