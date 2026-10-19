import type { CallToAction } from '@/content/types';
import type {
  Departure,
  ItineraryDay,
  Metric,
  Photo,
  ServiceChecklist,
  ServiceGroupKind,
} from '@/domain';

/*
 * Tipos del contenido de las páginas de viaje (`/viajes/<slug>`).
 *
 * Una sola plantilla (`features/trip-detail`) sirve a los cuatro viajes: cada
 * uno llena `TripDetailContent` con lo que tiene. Los bloques opcionales
 * (`fit`, `checklist`, `meals`) se omiten en los viajes que todavía no tienen
 * esa información, y la plantilla no los muestra.
 */

/* ────────────────────────────────────────────────────────────────────────── */
/*  Metadata                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

/** Lo que la página publica en el `<head>`: título, descripción y foto para compartir. */
export type TripMetaContent = {
  /** El `<title>` (el layout le suma " · Hoy Estoy Out Of Home") y el título de Open Graph. */
  readonly title: string;
  /** La `description` y la de Open Graph. */
  readonly description: string;
  /** La foto que se ve al compartir el link (Open Graph y Twitter). */
  readonly photo: Photo;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Portada                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * El `<h1>` del viaje, con un tramo opcional en dorado: "**Calle &** Stepanek"
 * (el `<span>` dorado de `dc.html:155`). El espacio entre los dos lo pone el
 * componente.
 */
export type TripTitleContent = {
  /** Tramo en dorado, al principio: "Calle &". */
  readonly accent?: string;
  /** El resto del título (o el título entero, si no hay tramo dorado). */
  readonly rest: string;
};

/**
 * Qué dato cuenta un tag de la portada. Cada uno lleva su tinte, y el tinte
 * es una decisión visual: la toma el feature según `kind`.
 */
export type TripTagKind = 'duration' | 'summit' | 'difficulty' | 'distance';

/** Un tag de la portada: "4 días, 3 noches", "Cumbre 4.290 m", "Dificultad media", "24 km". */
export type TripTagContent = {
  /** Qué dato es (decide el tinte). */
  readonly kind: TripTagKind;
  /** El texto del tag. */
  readonly label: string;
};

/** Portada de la página: foto grande, título, tags y los dos CTA. */
export type TripCoverContent = {
  /** Foto de fondo, a sangre. */
  readonly photo: Photo;
  /** "Todos los viajes": vuelve al carrusel del home (`homeAnchorTo('trips')`). */
  readonly backLink: CallToAction;
  /** Destino en mayúsculas arriba del título ("Mendoza", "Neuquén · Huella Andina"). */
  readonly eyebrow: string;
  /** El `<h1>`. */
  readonly title: TripTitleContent;
  /** Bajada en la fuente de títulos ("Tu primer 4mil"). Opcional. */
  readonly subtitle?: string;
  /** Nombre accesible de la lista de tags. */
  readonly tagsLabel: string;
  /** Duración, cumbre (si hay), dificultad y distancia, en ese orden. */
  readonly tags: readonly TripTagContent[];
  /** "Consultar": abre WhatsApp con el mensaje del viaje. */
  readonly consultCta: CallToAction;
  /** "Ver cronograma": baja al cronograma de la misma página. */
  readonly scheduleCta: CallToAction;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Presentación                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

/** Las stats con contador de la presentación ("24 km", "4 días"…). */
export type TripStatsContent = {
  /** Nombre accesible de la lista de stats. */
  readonly label: string;
  /** Las stats, en orden. Cada valor es un entero (lo anima el contador). */
  readonly items: readonly Metric[];
};

/** Bloque "Sobre el viaje": los párrafos de presentación y las stats. */
export type TripOverviewContent = {
  /** El `<h2>` del bloque. */
  readonly title: string;
  /** Párrafos de presentación, en orden. Puede estar vacío: entonces solo se ven las stats. */
  readonly paragraphs: readonly string[];
  /** Párrafo en negrita que cierra la presentación (Calle & Stepanek). Opcional. */
  readonly highlight?: string;
  /** Nota de modalidad y dificultad, debajo de las stats (Lago Lolog). Opcional. */
  readonly modality?: string;
  /** Las stats con contador. */
  readonly stats: TripStatsContent;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Cronograma                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

/** El aviso que reemplaza a la línea de tiempo cuando el viaje todavía no tiene itinerario. */
export type TripComingSoonContent = {
  /** "Itinerario próximamente" (`<h3>`, cuelga del `<h2>` "Cronograma"). */
  readonly title: string;
  /** El texto que lo explica. */
  readonly text: string;
  /** "Consultar" por WhatsApp, con el mensaje del viaje. */
  readonly cta: CallToAction;
};

/** Bloque "Cronograma": la línea de tiempo día por día, o el aviso de "próximamente". */
export type TripScheduleContent = {
  /** El `<h2>`: "Cronograma". */
  readonly title: string;
  /** Bajada con la duración: "4 días, 3 noches". */
  readonly subtitle: string;
  /** Los días, en orden. Vacío: se muestra `comingSoon`. */
  readonly days: readonly ItineraryDay[];
  /** El aviso para cuando `days` está vacío. */
  readonly comingSoon: TripComingSoonContent;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  ¿Puedo? / ¿Es para mí?                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

/** Un dato de "¿Puedo?": etiqueta y valor ("Clima" → "Cambiante"). */
export type TripFactContent = {
  /** La etiqueta, que el componente pasa a mayúsculas: "Clima". */
  readonly label: string;
  /** El valor: "Cambiante". */
  readonly value: string;
};

/** Card "¿Puedo?" (`dc.html:182-196`). */
export type TripRequirementsContent = {
  /** "¿Puedo?". */
  readonly title: string;
  /** La respuesta corta. */
  readonly lead: string;
  /** Los datos del terreno, en dos columnas. */
  readonly facts: readonly TripFactContent[];
};

/** Una lista con su rótulo: "Ideal si:" / "Trabajamos con:". */
export type TripAudienceListContent = {
  /** El rótulo en negrita arriba de la lista; también le da nombre accesible. */
  readonly title: string;
  /** Los ítems, en orden. */
  readonly items: readonly string[];
};

/** Card "¿Es para mí?" (`dc.html:197-209`). */
export type TripAudienceContent = {
  /** "¿Es para mí?". */
  readonly title: string;
  /** La respuesta corta. */
  readonly lead: string;
  /** "Ideal si:". */
  readonly ideal: TripAudienceListContent;
  /** "Trabajamos con:". */
  readonly approach: TripAudienceListContent;
};

/** Las dos cards que responden si el viaje es para vos. */
export type TripFitContent = {
  /** "¿Puedo?". */
  readonly requirements: TripRequirementsContent;
  /** "¿Es para mí?". */
  readonly audience: TripAudienceContent;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Qué incluye y qué necesito                                                */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Una card de la grilla: los grupos de la checklist que muestra, de arriba a
 * abajo. Nunca vacía (una card sin grupos sería una card en blanco).
 */
export type TripChecklistPanel = readonly [ServiceGroupKind, ...ServiceGroupKind[]];

/** Bloque "¿Qué incluye y qué necesito?": la checklist del viaje en cards. */
export type TripChecklistContent = {
  /** "Servicios y equipo". */
  readonly eyebrow: string;
  /** El `<h2>`: "¿Qué incluye y qué necesito?". */
  readonly title: string;
  /** Qué incluye el viaje y qué lleva el viajero. */
  readonly checklist: ServiceChecklist;
  /** Título de cada grupo. Es copy, por eso vive en el contenido y no en `ServiceChecklist`. */
  readonly groupTitles: { readonly [K in ServiceGroupKind]: string };
  /** Composición de la grilla: qué grupos lleva cada card. */
  readonly panels: readonly TripChecklistPanel[];
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Pensión completa                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

/** Una comida de la pensión: el epígrafe y la foto (ilustrativa, decorativa). */
export type TripMealContent = {
  /** "Desayuno": es el epígrafe y la `key` de la lista. */
  readonly name: string;
  /** Foto del plato con `alt=""`: el epígrafe ya la nombra. */
  readonly photo: Photo;
};

/** Bloque "Pensión completa" (`dc.html:271-283`). */
export type TripMealsContent = {
  /** Antetítulo gris ("Incluye"). */
  readonly kicker: string;
  /** El `<h2>`, con el asterisco que remite a la nota: "Pensión completa*". */
  readonly title: string;
  /** Las comidas del día, en orden. */
  readonly meals: readonly TripMealContent[];
  /** La aclaración del asterisco (propia de cada viaje). */
  readonly footnote: string;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Próximas salidas                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

/** Bloque "Próximas salidas": las fechas del calendario de este viaje. */
export type TripDeparturesContent = {
  /** El `<h2>`: "Próximas salidas". */
  readonly title: string;
  /** Las salidas del viaje, en orden. Vacío: el bloque no se muestra. */
  readonly departures: readonly Departure[];
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Cierre                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Cierre de la página: la invitación a consultar y el botón grande a WhatsApp.
 * No lleva montos: el cliente pidió que el sitio no muestre ningún precio, y
 * fechas, disponibilidad y valores se conversan por WhatsApp.
 */
export type TripClosingContent = {
  /** Alt del logo de la chapita crema. */
  readonly logoAlt: string;
  /** El `<h2>` en sus renglones ("La montaña te espera." / "¿Te animás a subir?"). */
  readonly titleLines: readonly string[];
  /** Bajada que invita a consultar las fechas y la disponibilidad de este viaje. */
  readonly lead: string;
  /** "Consultar por WhatsApp", con el mensaje del viaje. */
  readonly cta: CallToAction;
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Página                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Todo el contenido de la página de un viaje, bloque por bloque, en el orden
 * en que se muestran. `TripDetail` le pasa a cada bloque solo su parte.
 */
export type TripDetailContent = {
  /** `<head>`: título, descripción y foto para compartir. */
  readonly meta: TripMetaContent;
  /** Portada. */
  readonly cover: TripCoverContent;
  /** "Sobre el viaje". */
  readonly overview: TripOverviewContent;
  /** "Cronograma" (o "Itinerario próximamente"). */
  readonly schedule: TripScheduleContent;
  /** "¿Puedo?" / "¿Es para mí?". Opcional. */
  readonly fit?: TripFitContent;
  /** "¿Qué incluye y qué necesito?". Opcional. */
  readonly checklist?: TripChecklistContent;
  /** "Pensión completa". Opcional. */
  readonly meals?: TripMealsContent;
  /** "Próximas salidas" (no se muestra si no hay fechas). */
  readonly departures: TripDeparturesContent;
  /** Cierre: la invitación a consultar por WhatsApp. */
  readonly closing: TripClosingContent;
};
