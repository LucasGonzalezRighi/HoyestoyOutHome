import { ROUTES } from './routes';

/**
 * IDs de las secciones del home. Son los destinos de las anclas del nav y de
 * los CTA ("Ver próximos viajes" → `#viajes`).
 *
 * Prohibido escribir un `href="#..."` literal: siempre se importa de acá. Los
 * que ya existían en el diseño (`viajes`, `equipo`, `contacto`) conservan su
 * valor para que los links compartidos sigan funcionando.
 */
export const SECTION_IDS = {
  top: 'top',
  /** Destino del link "Saltar al contenido". Lo lleva el `<main>` de cada página. */
  content: 'contenido',
  trips: 'viajes',
  calendar: 'calendario',
  team: 'equipo',
  faq: 'preguntas',
  contact: 'contacto',
} as const;

/** Nombre lógico de una sección (`'trips'`, `'faq'`…), la clave para `anchorTo`. */
export type SectionKey = keyof typeof SECTION_IDS;

/**
 * Ancla (`#id`) a una sección **de la página actual**. Sirve para lo que
 * siempre apunta adentro de la misma página: "Saltar al contenido", el CTA del
 * hero que baja a los viajes, un link de una sección del home a otra.
 */
export function anchorTo(section: SectionKey): string {
  return `#${SECTION_IDS[section]}`;
}

/**
 * Link (`/#id`) a una sección **del home** desde cualquier página. Lo usan las
 * piezas que se ven en todas las páginas (nav, footer) y las páginas de viaje
 * ("Todos los viajes" → `/#viajes`).
 *
 * En el home, el navegador lo resuelve como un salto dentro del documento (la
 * ruta es la misma y cambia solo el `#`), así que no recarga la página.
 */
export function homeAnchorTo(section: SectionKey): string {
  return `${ROUTES.home}#${SECTION_IDS[section]}`;
}

/**
 * IDs de los bloques de la página de un viaje (`/viajes/<slug>`). Son los
 * mismos en todas las páginas de viaje, así un link compartido
 * (`/viajes/calle-stepanek#cronograma`) funciona igual en cualquiera.
 *
 * Van aparte de `SECTION_IDS` porque no son secciones del home: `homeAnchorTo`
 * no tiene que poder apuntarles.
 */
export const TRIP_SECTION_IDS = {
  overview: 'presentacion',
  schedule: 'cronograma',
  fit: 'para-vos',
  checklist: 'que-incluye',
  meals: 'pension',
  departures: 'salidas',
  closing: 'precio',
} as const;

/** Nombre lógico de un bloque de la página de viaje (`'schedule'`, `'closing'`…). */
export type TripSectionKey = keyof typeof TRIP_SECTION_IDS;

/**
 * Ancla (`#id`) a un bloque de la página de viaje actual: el CTA "Ver
 * cronograma" de la portada → `#cronograma`.
 */
export function tripAnchorTo(section: TripSectionKey): string {
  return `#${TRIP_SECTION_IDS[section]}`;
}
