import { tripCatalog, type Trip, type TripCallToAction } from '@/content/catalog/trips';
import type { CallToAction, SectionHeadingContent } from '@/content/types';
import { whatsapp } from '@/content/whatsapp';

/**
 * Una card de "Próximos viajes", ya resuelta: el viaje y el botón con su
 * texto y su destino.
 *
 * El viaje va como instancia de `Trip` (tiene comportamiento: `price.label()`,
 * `distanceLabel()`…); la card solo lo lee. La foto es `trip.photo`, con el
 * alt descriptivo del registro (`PHOTOS`): el diseño pone el nombre del viaje
 * (`alt="{{ trip.nombre }}"`, `dc.html:118`), que ya es el `h3` de la card y
 * el lector de pantalla leería dos veces.
 */
export type TripCardContent = {
  /** El viaje del catálogo: destino, nombre, foto, tags y precio salen de él. */
  readonly trip: Trip;
  /** "Ver viaje" (ancla a su sección) o "Consultar" (WhatsApp, pestaña nueva). */
  readonly cta: CallToAction;
};

/** Textos y cards de la sección 03 "Próximos viajes" (`dc.html:107-139`). */
export type TripsContent = Required<SectionHeadingContent> & {
  /** Bajada debajo del título, en la primera columna del riel. */
  readonly lead: string;
  /** Una card por viaje del catálogo, en el orden del catálogo. */
  readonly cards: readonly TripCardContent[];
};

/**
 * Texto del botón según a dónde lleva (`cta` del array `trips`, `dc.html:668-671`).
 * El dominio decide el destino (`trip.callToAction`) y el contenido pone el copy.
 */
const CTA_LABELS: Readonly<Record<TripCallToAction['kind'], string>> = {
  detail: 'Ver viaje',
  inquiry: 'Consultar',
};

/** Arma la card de un viaje: el viaje y el CTA con su texto. */
function toCard(trip: Trip): TripCardContent {
  const { kind, href, external } = trip.callToAction(whatsapp);
  return {
    trip,
    cta: { label: CTA_LABELS[kind], href, external },
  };
}

/**
 * Contenido de "Próximos viajes". Copys verbatim del marcado (`dc.html:111-113`);
 * los datos de cada viaje salen del catálogo (`tripCatalog`), no se repiten acá.
 */
export const tripsContent: TripsContent = {
  eyebrow: 'Próximos viajes',
  title: 'Elegí tu próxima aventura',
  lead: 'Deslizá hacia abajo y recorré las travesías. No necesitás experiencia en altura, solo ganas.',
  cards: tripCatalog.all().map(toCard),
};
