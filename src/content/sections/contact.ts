import { SITE, SOCIAL_PROFILES } from '@/constants/site';
import { tripCatalog } from '@/content/catalog/trips';
import type { CallToAction } from '@/content/types';
import { whatsapp } from '@/content/whatsapp';
import { Price } from '@/domain';

/* ────────────────────────────────────────────────────────────────────────── */
/*  13 Precio y contacto                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * El precio grande de la tarjeta: `$` fijo + el monto, que cuenta desde 0 con
 * el scroll (`dc.html:367`).
 */
export type ContactPriceContent = {
  /**
   * Símbolo de la moneda (`Price.CURRENCY_SYMBOL`, el mismo que usa `label()`).
   * Va fuera del contador: el motor solo reescribe los dígitos.
   */
  readonly symbol: string;
  /**
   * El precio publicado del viaje (instancia del dominio). La sección le pide
   * `inThousands()` para el contador y el monto formateado para el texto del
   * servidor, que es el que se lee sin JS.
   */
  readonly value: Price;
};

/**
 * Textos de "13 Precio y contacto" (`dc.html:361-373`): la tarjeta verde del
 * cierre, con el precio de Calle & Stepanek y el CTA final a WhatsApp.
 */
export type ContactContent = {
  /** Alt del logo de la chapita crema de arriba. */
  readonly logoAlt: string;
  /** Renglón sobre el precio: "Calle & Stepanek · Precio por persona". */
  readonly kicker: string;
  /** El precio grande (`$690.000`): el símbolo fijo y el monto que cuenta con el scroll. */
  readonly price: ContactPriceContent;
  /** Nota de la seña, abajo del precio. */
  readonly note: string;
  /** El título en sus dos renglones ("La montaña te espera." / "¿Te animás a subir?"). */
  readonly titleLines: readonly string[];
  /** "Reservá tu lugar por WhatsApp": abre el chat con el mensaje por defecto. */
  readonly cta: CallToAction;
};

/** El viaje del cierre: el precio que se muestra es el suyo, tal cual figura en el catálogo. */
const featuredTrip = tripCatalog.get('calle-stepanek');

/**
 * Seña para reservar Calle & Stepanek (`dc.html:368`). Vive acá y no en el
 * catálogo porque hoy solo la menciona esta nota; es un `Price` para que se
 * formatee igual que el precio (`$200.000`).
 */
const DEPOSIT = Price.of(200000);

/** Contenido de "13 Precio y contacto". Copys verbatim de `dc.html:365-371`. */
export const contactContent: ContactContent = {
  logoAlt: SITE.shortName,
  kicker: `${featuredTrip.shortName} · Precio por persona`,
  price: {
    symbol: Price.CURRENCY_SYMBOL,
    value: featuredTrip.price,
  },
  note: `*Seña de ${DEPOSIT.label()}. La diferencia la podés abonar el día de encuentro.`,
  titleLines: ['La montaña te espera.', '¿Te animás a subir?'],
  cta: {
    label: 'Reservá tu lugar por WhatsApp',
    href: whatsapp.href(),
    external: true,
  },
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Footer                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Textos del footer del sitio (`dc.html:374-382`): marca, redes + WhatsApp y
 * la nota de cierre. En el diseño vive adentro de la sección 13; acá es el
 * `<footer>` de la página (fuera del `<main>`), por eso tiene slice propio.
 */
export type FooterContent = {
  /** Nombre de la marca, en la tipografía de títulos. */
  readonly brand: string;
  /** Nombre accesible de la lista de links (el diseño no lo trae: es una lista sin título visible). */
  readonly linksLabel: string;
  /** Instagram, TikTok y WhatsApp. Todos salen del sitio (`external: true`). */
  readonly links: readonly CallToAction[];
  /** "Turismo Aventura · Argentina · 2026". */
  readonly note: string;
};

/**
 * Contenido del footer. Los destinos salen de `SOCIAL_PROFILES` y de la
 * instancia `whatsapp`: ningún link se escribe a mano.
 */
export const footerContent: FooterContent = {
  brand: SITE.name,
  linksLabel: 'Redes y contacto',
  links: [
    { label: 'Instagram', href: SOCIAL_PROFILES.instagram.url, external: true },
    { label: 'TikTok', href: SOCIAL_PROFILES.tiktok.url, external: true },
    { label: 'WhatsApp', href: whatsapp.href(), external: true },
  ],
  note: 'Turismo Aventura · Argentina · 2026',
};
