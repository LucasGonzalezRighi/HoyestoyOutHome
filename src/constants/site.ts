/**
 * Datos de la marca. Tal como figuran en el diseño de Claude Design
 * (`docs/design/hoy-estoy-ooh-landing.dc.html`, props del bloque `data-props`).
 *
 * Acá vive lo que **configura** la marca (teléfono, perfiles, flags). Los
 * textos que se leen en pantalla viven en `src/content/`.
 *
 * Este módulo también corre en el cliente (lo importan `content/` y el motor),
 * así que no lee variables de entorno: la URL pública vive en `siteUrl.ts`.
 */
export const SITE = {
  name: 'Hoy Estoy Out Of Home',
  shortName: 'Hoy Estoy OOH',
  /** Locale de formateo de números y precios (`1.900`, `$690.000`). */
  locale: 'es-AR',
  /** Atributo `lang` del `<html>`. */
  htmlLang: 'es-AR',
  /** Locale de Open Graph (usa guion bajo, no guion medio). */
  ogLocale: 'es_AR',
} as const;

/**
 * WhatsApp es el único canal de contacto: no hay formulario ni backend.
 *
 * `phone` va en formato internacional sin `+` ni espacios, que es lo que
 * espera `wa.me`. El link se arma con la clase `WhatsAppLink` del dominio.
 */
export const WHATSAPP = {
  phone: '541153347012',
  defaultMessage: 'Hola! Quiero info sobre los viajes de Hoy Estoy Out Of Home',
} as const;

/** Perfiles públicos de la marca (footer y galería). */
export const SOCIAL_PROFILES = {
  instagram: {
    handle: 'chichizolalucas',
    url: 'https://instagram.com/chichizolalucas',
  },
  tiktok: {
    handle: 'lucas.turismoaventura',
    url: 'https://www.tiktok.com/@lucas.turismoaventura',
  },
} as const;

/** Interruptores de producto. Equivalen a los toggles del diseño. */
export const FEATURE_FLAGS = {
  /** Botón flotante de WhatsApp abajo a la derecha (prop `showFloat` del diseño). */
  floatingWhatsApp: true,
} as const;
