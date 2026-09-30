/**
 * Tipos que comparten los slices de `content/sections/`.
 *
 * Solo entra acá lo que se repite entre secciones; lo propio de una sección
 * vive en su slice junto a su `…Content`. Son tipos de **datos planos** (todo
 * `readonly`): el contenido se escribe una vez y nadie lo muta.
 */

/**
 * Un botón o link con destino: los CTA del hero, del nav y del cierre, y los
 * links del footer.
 *
 * `external` marca los que salen de la landing (WhatsApp, Instagram, TikTok):
 * el componente los abre en pestaña nueva con `rel="noopener noreferrer"`. Las anclas
 * internas (`anchorTo('trips')`) lo omiten.
 */
export type CallToAction = {
  /** Texto del botón o del link. */
  readonly label: string;
  /** Destino: un ancla (`anchorTo(…)`) o una URL absoluta. */
  readonly href: string;
  /** Sale de la landing: se abre en pestaña nueva. */
  readonly external?: boolean;
};

/** Un link del nav: siempre es un ancla a una sección de la landing (`anchorTo(…)`). */
export type NavLinkContent = {
  /** Texto del link. */
  readonly label: string;
  /** Ancla a la sección (`anchorTo(…)`). */
  readonly href: string;
};

/**
 * El encabezado de una sección: el eyebrow en mayúsculas ("Por qué viajar con
 * nosotros", "Servicios y equipo") y el título.
 *
 * El eyebrow es opcional porque varias secciones del diseño arrancan directo
 * con el título (Testimonios, Galería). Lo que viene después del título
 * (bajada, párrafos, subtítulo) cambia de forma en cada sección, así que cada
 * slice lo agrega con una intersección: `SectionHeadingContent & { lead: string }`.
 */
export type SectionHeadingContent = {
  /** Rótulo chico en mayúsculas arriba del título. Opcional. */
  readonly eyebrow?: string;
  /** El título de la sección (`<h2>`). */
  readonly title: string;
};
