import { calendarContent } from './sections/calendar';
import { contactContent, footerContent } from './sections/contact';
import { faqContent } from './sections/faq';
import { galleryContent } from './sections/gallery';
import { heroContent } from './sections/hero';
import { siteContent } from './sections/site';
import { teamContent } from './sections/team';
import { testimonialsContent } from './sections/testimonials';
import { tripsContent } from './sections/trips';
import { whyUsContent } from './sections/why-us';

/**
 * Todo lo que se lee en el home, un slice por sección (lo de cada viaje vive
 * en `content/trips/`).
 *
 * Es el equivalente al diccionario de Kora: `Landing` le pasa a cada sección
 * solo su porción. Hoy hay un solo idioma (es-AR); si se suma otro, esto pasa
 * a ser `getLandingContent(locale)` y cada slice se tipa contra el español.
 *
 * `site` (nav, metadata, "Saltar al contenido") y `footer` los consume el
 * layout, no `Landing`: son iguales en todas las páginas.
 */
export const landingContent = {
  site: siteContent,
  hero: heroContent,
  whyUs: whyUsContent,
  trips: tripsContent,
  calendar: calendarContent,
  team: teamContent,
  testimonials: testimonialsContent,
  gallery: galleryContent,
  faq: faqContent,
  contact: contactContent,
  footer: footerContent,
} as const;

/** Forma completa del contenido de la landing. */
export type LandingContent = typeof landingContent;

export { PHOTOS } from './media';
export { tripCatalog } from './catalog/trips';
export { whatsapp } from './whatsapp';
export type { CallToAction, NavLinkContent, SectionHeadingContent } from './types';
