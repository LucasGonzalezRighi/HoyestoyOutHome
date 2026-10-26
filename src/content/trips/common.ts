import { homeAnchorTo, tripAnchorTo } from '@/constants/sections';
import { SITE } from '@/constants/site';
import { PHOTOS } from '@/content/media';
import type { CallToAction } from '@/content/types';
import { whatsapp } from '@/content/whatsapp';
import type { Departure, ItineraryDay, ServiceChecklist, Trip } from '@/domain';

import type {
  TripChecklistContent,
  TripClosingContent,
  TripCoverContent,
  TripDeparturesContent,
  TripMealsContent,
  TripMetaContent,
  TripScheduleContent,
  TripTagContent,
  TripTitleContent,
} from './types';

/*
 * Lo que comparten todas las páginas de viaje: los copys de la plantilla
 * ("Cronograma", "Consultar", "Pensión completa*"…) y las funciones que arman
 * cada bloque a partir del viaje del catálogo.
 *
 * `buildTripDetail` (`build.ts`) llama a estas funciones con lo propio de cada
 * viaje (lo que se carga en el panel), así un copy de la plantilla se cambia
 * acá una sola vez y los datos del viaje (duración, distancia, cumbre) salen
 * siempre del catálogo.
 */

/**
 * Lo que se le ofrece contar a quien escribe por un viaje que todavía no tiene
 * itinerario: va en el aviso del cronograma y en la descripción de la página.
 * Sin montos (el sitio no muestra ninguno).
 */
const UPCOMING_INVITATION =
  'Escribinos y te contamos las fechas, la disponibilidad y todo lo que incluye.';

/** Etiqueta del botón que abre WhatsApp desde la portada y desde "Itinerario próximamente". */
const CONSULT_LABEL = 'Consultar';

/**
 * Mensaje precargado del "Consultar" de cada viaje: "Hola! Quiero consultar
 * por Calle & Stepanek". Así quien atiende el WhatsApp sabe de qué viaje viene
 * la consulta.
 */
function consultMessage(trip: Trip): string {
  return `Hola! Quiero consultar por ${trip.shortName}`;
}

/** Un CTA a WhatsApp con el mensaje del viaje (sale del sitio: `external`). */
function consultCta(trip: Trip, label: string): CallToAction {
  return { label, href: whatsapp.href(consultMessage(trip)), external: true };
}

/* ── Metadata ──────────────────────────────────────────────────────────── */

/** `<head>` de la página: el nombre completo del viaje, su descripción y su foto. */
export function tripMeta(trip: Trip, description: string): TripMetaContent {
  return { title: trip.name, description, photo: trip.photo };
}

/* ── Portada ───────────────────────────────────────────────────────────── */

/** Lo propio de la portada de cada viaje. */
export type TripCoverCopy = {
  /** Destino en mayúsculas arriba del título. */
  readonly eyebrow: string;
  /** El `<h1>`, con su tramo dorado si tiene. */
  readonly title: TripTitleContent;
  /** Bajada debajo del título. */
  readonly subtitle?: string;
};

/**
 * Los tags de la portada, todos del catálogo: duración, cumbre (solo si el
 * viaje tiene), dificultad y distancia.
 */
function tripTags(trip: Trip): readonly TripTagContent[] {
  const summit = trip.summitLabel();
  return [
    { kind: 'duration', label: trip.duration.sentence() },
    ...(summit ? [{ kind: 'summit', label: summit } as const] : []),
    { kind: 'difficulty', label: trip.difficultyLabel() },
    { kind: 'distance', label: trip.distanceLabel() },
  ];
}

/** Portada: foto, "Todos los viajes", título, tags, "Consultar" y "Ver cronograma". */
export function tripCover(trip: Trip, copy: TripCoverCopy): TripCoverContent {
  return {
    photo: trip.photo,
    backLink: { label: 'Todos los viajes', href: homeAnchorTo('trips') },
    eyebrow: copy.eyebrow,
    title: copy.title,
    ...(copy.subtitle ? { subtitle: copy.subtitle } : {}),
    tagsLabel: 'Datos del viaje',
    tags: tripTags(trip),
    consultCta: consultCta(trip, CONSULT_LABEL),
    scheduleCta: { label: 'Ver cronograma', href: tripAnchorTo('schedule') },
  };
}

/* ── Presentación ──────────────────────────────────────────────────────── */

/** El `<h2>` de la presentación y el nombre accesible de sus stats. */
export const OVERVIEW_COPY = {
  title: 'Sobre el viaje',
  statsLabel: 'El viaje en números',
} as const;

/* ── Cronograma ────────────────────────────────────────────────────────── */

/**
 * Cronograma: la duración del catálogo como bajada y los días del viaje. Sin
 * días (`[]`), la página muestra "Itinerario próximamente".
 */
export function tripSchedule(trip: Trip, days: readonly ItineraryDay[]): TripScheduleContent {
  return {
    title: 'Cronograma',
    subtitle: trip.duration.sentence(),
    days,
    comingSoon: {
      title: 'Itinerario próximamente',
      text: `Estamos terminando de armar el itinerario de este viaje. ${UPCOMING_INVITATION}`,
      cta: consultCta(trip, CONSULT_LABEL),
    },
  };
}

/* ── Qué incluye y qué necesito ────────────────────────────────────────── */

/**
 * "¿Qué incluye y qué necesito?" con la checklist del viaje. Títulos de grupo
 * y composición de las cards son los de "09 Servicios y equipo" del diseño
 * (`dc.html:285-312`, `panels` en `dc.html:702-707`): [incluidos] ·
 * [traslados + NO incluidos] · [ropa] · [equipo].
 */
export function tripChecklist(checklist: ServiceChecklist): TripChecklistContent {
  return {
    eyebrow: 'Servicios y equipo',
    title: '¿Qué incluye y qué necesito?',
    checklist,
    groupTitles: {
      included: 'Servicios incluidos',
      transfers: 'Traslados',
      notIncluded: 'Servicios NO incluidos',
      clothing: '¿Qué necesito? · Ropa',
      gear: '¿Qué necesito? · Equipo',
    },
    panels: [['included'], ['transfers', 'notIncluded'], ['clothing'], ['gear']],
  };
}

/* ── Pensión completa ──────────────────────────────────────────────────── */

/**
 * "Pensión completa" (`dc.html:271-283`). Los platos van con `alt=""`: cada
 * foto está en un `<figure>` cuyo `<figcaption>` ya nombra la comida, y las
 * imágenes son ilustrativas (lo avisa la nota).
 *
 * @param footnote La nota del asterisco ("*Las imágenes son a modo de ilustración.").
 */
export function tripMeals(footnote: string): TripMealsContent {
  return {
    kicker: 'Incluye',
    title: 'Pensión completa*',
    meals: [
      { name: 'Desayuno', photo: PHOTOS.foodBreakfast.withAlt('') },
      { name: 'Almuerzo', photo: PHOTOS.foodLunch.withAlt('') },
      { name: 'Merienda', photo: PHOTOS.foodAfternoonSnack.withAlt('') },
      { name: 'Cena', photo: PHOTOS.foodDinner.withAlt('') },
    ],
    footnote,
  };
}

/* ── Próximas salidas ──────────────────────────────────────────────────── */

/** Las próximas salidas de este viaje (`schedule.forTrip(slug)`). Vacío: el bloque no se muestra. */
export function tripDepartures(departures: readonly Departure[]): TripDeparturesContent {
  return { title: 'Próximas salidas', departures };
}

/* ── Cierre ────────────────────────────────────────────────────────────── */

/**
 * Cierre: el título del cierre del diseño (`dc.html:369`), una bajada que
 * invita a consultar por este viaje y el botón a WhatsApp con su mensaje.
 *
 * Sin montos, por pedido del cliente: el valor del viaje sigue en el catálogo
 * (`trip.price`) pero no se muestra, se conversa por WhatsApp.
 */
export function tripClosing(trip: Trip): TripClosingContent {
  return {
    logoAlt: SITE.shortName,
    titleLines: ['La montaña te espera.', '¿Te animás a subir?'],
    lead: `Escribinos y te contamos las próximas fechas y la disponibilidad de ${trip.shortName}.`,
    cta: consultCta(trip, 'Consultar por WhatsApp'),
  };
}
