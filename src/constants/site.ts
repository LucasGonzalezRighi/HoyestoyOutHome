/**
 * Datos de la marca. Tal como figuran en el diseño de Claude Design
 * (`docs/design/hoy-estoy-ooh-landing.dc.html`, props del bloque `data-props`).
 *
 * Acá vive lo que **configura** la marca (teléfono, perfiles, flags). Los
 * textos que se leen en pantalla viven en `src/content/`.
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

/** URL de desarrollo: la que usa `npm run dev` si no hay `.env.local`. */
const FALLBACK_SITE_URL = 'http://localhost:3000';

/**
 * URL pública del sitio, desde `NEXT_PUBLIC_APP_URL`.
 *
 * La usan la metadata (base de las URLs absolutas de Open Graph y del
 * canonical), `robots.ts` y `sitemap.ts`: vive en un solo lugar para que las
 * tres coincidan.
 *
 * Con `||` y no `??`: una variable definida pero vacía (`NEXT_PUBLIC_APP_URL=`,
 * como queda al copiar un `.env` a medio completar) también cae al fallback.
 * Si la variable trae algo que no es una URL, `new URL` tira en el build:
 * mejor enterarse ahí que publicar links rotos.
 */
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_APP_URL || FALLBACK_SITE_URL);

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
