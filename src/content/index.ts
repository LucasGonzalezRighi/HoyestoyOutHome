import { buildDepartureSchedule } from './catalog/departures';
import { buildTripCatalog } from './catalog/trips';
import type { SiteRecord } from './records/schema';
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
import { buildTripDetail, type TripDetailContent } from './trips';

import type { DepartureSchedule, TripCatalog } from '@/domain';

/**
 * Todo lo que se lee en el home, un slice por sección (lo de cada viaje vive
 * en `content/trips/`).
 *
 * Es el equivalente al diccionario de Kora: `Landing` le pasa a cada sección
 * solo su porción. Hoy hay un solo idioma (es-AR).
 *
 * `site` (nav, metadata, "Saltar al contenido") y `footer` los consume el
 * layout, no `Landing`: son iguales en todas las páginas y no se editan desde
 * el panel.
 */
export type LandingContent = {
  readonly site: typeof siteContent;
  readonly hero: ReturnType<typeof heroContent>;
  readonly whyUs: ReturnType<typeof whyUsContent>;
  readonly trips: ReturnType<typeof tripsContent>;
  readonly calendar: ReturnType<typeof calendarContent>;
  readonly team: typeof teamContent;
  readonly testimonials: ReturnType<typeof testimonialsContent>;
  readonly gallery: typeof galleryContent;
  readonly faq: ReturnType<typeof faqContent>;
  readonly contact: ReturnType<typeof contactContent>;
  readonly footer: typeof footerContent;
};

/** El contenido del sitio ya armado: catálogo, calendario, home y páginas de viaje. */
export type SiteContent = {
  /** Los viajes visibles, en orden. */
  readonly catalog: TripCatalog;
  /** Las próximas salidas de los viajes visibles. */
  readonly schedule: DepartureSchedule;
  /** El home. */
  readonly landing: LandingContent;
  /** La página de un viaje visible, o `undefined` (la página responde 404). */
  tripDetail(slug: string): TripDetailContent | undefined;
};

/**
 * Arma todo el contenido del sitio a partir de lo guardado (el panel de
 * administración, o `SEED_RECORD` si la base todavía no tiene nada): las
 * clases del dominio (catálogo, calendario) y los slices de cada sección.
 *
 * Es una función pura: no lee la base ni el reloj. Quién le pasa el contenido
 * y la fecha de hoy es `server/content/siteContent.ts`.
 *
 * @param record El contenido editable, ya validado (`siteRecordSchema`).
 * @param today `AAAA-MM-DD`: las salidas anteriores no se muestran.
 * @throws Si un dato rompe una invariante del dominio (el panel lo valida
 *   con esta misma función antes de guardar).
 */
export function buildSiteContent(record: SiteRecord, today: string): SiteContent {
  const catalog = buildTripCatalog(record.trips);
  const schedule = buildDepartureSchedule(record.departures, catalog, today);
  const { home } = record;
  const framing = Object.fromEntries(
    record.trips.map((trip) => [trip.slug, trip.panelPosition] as const),
  );

  const landing: LandingContent = {
    site: siteContent,
    hero: heroContent(home.hero),
    whyUs: whyUsContent(home.whyUs),
    trips: tripsContent(catalog, home.trips, framing),
    calendar: calendarContent(schedule, home.calendar),
    team: teamContent,
    testimonials: testimonialsContent(record.testimonials, home.testimonials),
    gallery: galleryContent,
    faq: faqContent(record.faq, home.faq),
    contact: contactContent(catalog, home.contact),
    footer: footerContent,
  };

  // Las páginas de viaje se arman todas ahora (son pocas) para que un dato
  // roto salte al validar en el panel y no recién al abrir esa página.
  const details = new Map(
    record.trips
      .filter((trip) => trip.visible)
      .map((trip) => [
        trip.slug,
        buildTripDetail(catalog.get(trip.slug), trip, schedule.forTrip(trip.slug)),
      ]),
  );

  return {
    catalog,
    schedule,
    landing,
    tripDetail: (slug) => details.get(slug),
  };
}

export { PHOTOS } from './media';
export { whatsapp } from './whatsapp';
export type { CallToAction, NavLinkContent, SectionHeadingContent } from './types';
