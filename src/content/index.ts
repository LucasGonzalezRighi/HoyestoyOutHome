import { calleStepanekContent } from './sections/calle-stepanek';
import { contactContent, footerContent } from './sections/contact';
import { galleryContent } from './sections/gallery';
import { heroContent } from './sections/hero';
import { lologContent } from './sections/lolog';
import { mealsContent } from './sections/meals';
import { mountainBannerContent } from './sections/mountain-banner';
import { servicesContent } from './sections/services';
import { siteContent } from './sections/site';
import { teamContent } from './sections/team';
import { testimonialsContent } from './sections/testimonials';
import { tripsContent } from './sections/trips';
import { whyUsContent } from './sections/why-us';

/**
 * Todo lo que se lee en la landing, un slice por sección.
 *
 * Es el equivalente al diccionario de Kora: `Landing` le pasa a cada sección
 * solo su porción. Hoy hay un solo idioma (es-AR); si se suma otro, esto pasa
 * a ser `getLandingContent(locale)` y cada slice se tipa contra el español.
 *
 * `site` (nav, telón, metadata) lo consume el layout, no `Landing`.
 */
export const landingContent = {
  site: siteContent,
  hero: heroContent,
  whyUs: whyUsContent,
  trips: tripsContent,
  calleStepanek: calleStepanekContent,
  mountainBanner: mountainBannerContent,
  lolog: lologContent,
  meals: mealsContent,
  services: servicesContent,
  team: teamContent,
  testimonials: testimonialsContent,
  gallery: galleryContent,
  contact: contactContent,
  footer: footerContent,
} as const;

/** Forma completa del contenido de la landing. */
export type LandingContent = typeof landingContent;

export { PHOTOS } from './media';
export { tripCatalog } from './catalog/trips';
export { whatsapp } from './whatsapp';
export type { CallToAction, NavLinkContent, SectionHeadingContent } from './types';
