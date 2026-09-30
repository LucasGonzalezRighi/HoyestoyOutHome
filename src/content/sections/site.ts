import { anchorTo } from '@/constants/sections';
import { SITE } from '@/constants/site';
import { PHOTOS } from '@/content/media';
import type { NavLinkContent } from '@/content/types';

/**
 * Textos del "chrome" del sitio: lo que no pertenece a ninguna sección y lo
 * consume el layout (metadata, link de salto, nav, telón y botón flotante).
 */
export type SiteContent = {
  /** Metadata de la página (`<title>`, description, Open Graph). */
  meta: { title: string; description: string; keywords: readonly string[]; ogImageAlt: string };
  /** Link "Saltar al contenido" para teclado y lectores de pantalla. */
  skipLink: string;
  /** La marca del nav: nombre en dos renglones + alt del logo. */
  brand: { name: string; tagline: string; logoAlt: string };
  /** El nav: su nombre accesible, los links a las secciones y el texto del CTA de WhatsApp. */
  nav: { ariaLabel: string; links: readonly NavLinkContent[]; cta: string };
  /** Telón de entrada: el logo y el nombre que se ven antes de que se abra. */
  curtain: { title: string; logoAlt: string };
  /** Botón flotante de WhatsApp: es solo un ícono, así que su nombre va en `aria-label`. */
  floatingWhatsApp: { ariaLabel: string };
};

/**
 * Los textos del chrome. Los que coinciden con el nombre de la marca salen de
 * `SITE` para que un cambio de marca no deje un alt desactualizado.
 */
export const siteContent: SiteContent = {
  meta: {
    // El diseño no trae metadata: título y description salen del copy del hero.
    // La description es la bajada del hero tal cual (118 caracteres: entra
    // entera en un resultado de búsqueda, que corta cerca de los 155).
    title: `${SITE.name} — Trekkings y ascensos guiados en Mendoza y la Patagonia`,
    description:
      'Trekkings y ascensos guiados por Mendoza y la Patagonia. Grupos chicos, atención personalizada y la montaña de verdad.',
    keywords: [
      'trekking',
      'ascensos guiados',
      'turismo aventura',
      'montañismo',
      'guías de montaña',
      'primer 4mil',
      'Calle & Stepanek',
      'Cerro Adolfo Calle',
      'Vallecitos',
      'Mendoza',
      'Lago Lolog',
      'Laguna Verde',
      'Huella Andina',
      'Neuquén',
      'Patagonia',
      SITE.name,
    ],
    ogImageAlt: PHOTOS.heroRange.alt,
  },
  skipLink: 'Saltar al contenido',
  brand: {
    name: 'Hoy Estoy',
    tagline: 'Out Of Home',
    logoAlt: `Logo ${SITE.shortName}`,
  },
  nav: {
    ariaLabel: 'Navegación principal',
    links: [
      { label: 'Viajes', href: anchorTo('trips') },
      { label: 'Calle & Stepanek', href: anchorTo('calleStepanek') },
      { label: 'Lolog', href: anchorTo('lolog') },
      { label: 'Quiénes somos', href: anchorTo('team') },
    ],
    cta: 'Escribinos',
  },
  curtain: {
    title: SITE.name,
    logoAlt: SITE.shortName,
  },
  floatingWhatsApp: {
    ariaLabel: 'Escribinos por WhatsApp',
  },
};
