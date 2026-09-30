/**
 * API pública del dominio: las clases del negocio de Hoy Estoy Out Of Home.
 *
 * TypeScript puro (sin React ni DOM). Desde afuera se importa solo de acá:
 * `import { Trip, Price } from '@/domain'`. Ver `README.md`.
 */

export { WhatsAppLink } from './contact/WhatsAppLink';

export { ItineraryStage, type ItineraryStageParams } from './itinerary/ItineraryStage';
export { ScheduleDay, type ScheduleDayParams } from './itinerary/ScheduleDay';

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
export {
  TRIP_SLUGS,
  Trip,
  isTripSlug,
  type TripCallToAction,
  type TripParams,
  type TripSlug,
} from './trips/Trip';
export { TripCatalog } from './trips/TripCatalog';
export { TripDuration } from './trips/TripDuration';
