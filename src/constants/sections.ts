/**
 * IDs de las secciones de la landing. Son los destinos de las anclas del nav y
 * de los CTA ("Ver próximos viajes" → `#viajes`).
 *
 * Prohibido escribir un `href="#..."` literal: siempre se importa de acá. Los
 * valores coinciden con los del diseño para que los links compartidos sigan
 * funcionando.
 */
export const SECTION_IDS = {
  top: 'top',
  /** Destino del link "Saltar al contenido". */
  content: 'contenido',
  trips: 'viajes',
  calleStepanek: 'calle',
  lolog: 'lolog',
  team: 'equipo',
  contact: 'contacto',
} as const;

/** Nombre lógico de una sección (`'trips'`, `'lolog'`…), la clave para `anchorTo`. */
export type SectionKey = keyof typeof SECTION_IDS;

/** Ancla (`#id`) a una sección de la landing. */
export function anchorTo(section: SectionKey): string {
  return `#${SECTION_IDS[section]}`;
}
