import { tripPath } from '@/constants/routes';
import { tripCatalog, type Trip, type TripSlug } from '@/content/catalog/trips';
import type { CallToAction, SectionHeadingContent } from '@/content/types';
import type { Photo } from '@/domain';

/**
 * Un panel del abanico de "Próximos viajes", ya resuelto: el viaje, el botón a
 * su página y lo que se anuncia cuando una flecha lo abre.
 *
 * El viaje va como instancia de `Trip` (tiene comportamiento:
 * `duration.label()`, `distanceLabel()`…); el panel solo lo lee. La foto es
 * la del viaje, con el alt descriptivo del registro (`PHOTOS`): el nombre del
 * viaje ya es el `h3` del panel y el lector de pantalla lo leería dos veces.
 *
 * No lleva precio: por pedido del cliente, en el home no aparece ninguno (el
 * precio de cada viaje vive en el cierre de su página).
 */
export type TripPanelContent = {
  /** El viaje del catálogo: destino, nombres y tags salen de él. */
  readonly trip: Trip;
  /** La foto del viaje con el encuadre del panel (ver `PANEL_FRAMING`). */
  readonly photo: Photo;
  /** "Ver detalles": lleva a la página del viaje (`tripPath(trip.slug)`). */
  readonly cta: CallToAction;
  /**
   * Lo que oye quien usa lector de pantalla cuando una flecha cambia de viaje
   * ("Viaje 2 de 4: Lago Lolog a Laguna Verde"). El contador que se ve
   * ("02 / 04") es decorativo y no dice qué viaje es.
   */
  readonly positionLabel: string;
};

/**
 * Nombres accesibles de las flechas del abanico. No se ven, pero se leen: por
 * eso viven acá y no en el componente.
 */
export type TripsControlsContent = {
  /** Nombre del botón que abre el viaje anterior (es solo un ícono). */
  readonly previousLabel: string;
  /** Nombre del botón que abre el viaje siguiente (es solo un ícono). */
  readonly nextLabel: string;
};

/** Textos y paneles de la sección "Próximos viajes" del home. */
export type TripsContent = Required<SectionHeadingContent> & {
  /** Bajada, a la derecha del título. */
  readonly lead: string;
  /** Datos generales de las travesías, debajo de la bajada: cortos y sin números de un viaje en particular. */
  readonly facts: readonly string[];
  /** Nombres accesibles de las flechas. */
  readonly controls: TripsControlsContent;
  /** Un panel por viaje del catálogo, en el orden del catálogo. */
  readonly panels: readonly TripPanelContent[];
};

/**
 * Texto del único botón del panel. Es el mismo para todos los viajes: los que
 * todavía no tienen itinerario también tienen página (con el aviso
 * "Itinerario próximamente" y "Consultar").
 */
const DETAIL_LABEL = 'Ver detalles';

/** "4 travesías": la cantidad sale del catálogo, así no queda vieja cuando se suma un viaje. */
function tripCountLabel(count: number): string {
  return count === 1 ? '1 travesía' : `${count} travesías`;
}

/**
 * Encuadre de la foto en el panel, para los viajes en los que el del catálogo
 * (pensado para la portada de la página del viaje) deja algo detrás del texto.
 * El texto del panel va abajo, sobre un velo oscuro:
 *
 * - Calle & Stepanek: con `center 62%` el cartel de cumbre cae justo detrás
 *   del título. Desde arriba, el panel muestra el cielo y los picos nevados,
 *   y el cartel queda al pie, bajo el velo.
 * - Laguna Negra: con `center 70%` las caras del grupo quedan detrás del
 *   título. Más arriba se ve más cielo estrellado y el grupo baja al pie.
 */
const PANEL_FRAMING: Partial<Record<TripSlug, string>> = {
  'calle-stepanek': 'center 0%',
  'laguna-negra': 'center 22%',
};

/** Arma el panel de un viaje: el viaje, su foto, el botón a su página y su posición en la lista. */
function toPanel(trip: Trip, index: number, trips: readonly Trip[]): TripPanelContent {
  const framing = PANEL_FRAMING[trip.slug];
  return {
    trip,
    photo: framing ? trip.photo.withPosition(framing) : trip.photo,
    cta: { label: DETAIL_LABEL, href: tripPath(trip.slug) },
    positionLabel: `Viaje ${index + 1} de ${trips.length}: ${trip.name}`,
  };
}

/**
 * Contenido de "Próximos viajes". Eyebrow y título verbatim del diseño
 * (`dc.html:111-112`). La bajada y los datos son del rediseño de octubre de
 * 2026 (el abanico de paneles): la bajada ya no habla de deslizar ni de
 * flechas, porque los viajes se recorren pasando por encima. Los datos de cada
 * viaje salen del catálogo (`tripCatalog`), no se repiten acá.
 */
export const tripsContent: TripsContent = {
  eyebrow: 'Próximos viajes',
  title: 'Elegí tu próxima aventura',
  lead: 'Pasá por cada travesía y entrá a la que te llame. No necesitás experiencia en altura, solo ganas.',
  facts: [tripCountLabel(tripCatalog.size), 'Mendoza y Patagonia', 'Grupos chicos'],
  controls: {
    previousLabel: 'Viaje anterior',
    nextLabel: 'Viaje siguiente',
  },
  panels: tripCatalog.all().map(toPanel),
};
