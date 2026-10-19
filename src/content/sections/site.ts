import { homeAnchorTo } from '@/constants/sections';
import { SITE } from '@/constants/site';
import { PHOTOS } from '@/content/media';
import type { NavLinkContent } from '@/content/types';

/**
 * Textos del "chrome" del sitio: lo que no pertenece a ninguna sección y lo
 * consume el layout, igual en todas las páginas (metadata, link de salto, nav
 * y botón flotante).
 */
export type SiteContent = {
  /** Metadata de la página (`<title>`, description, Open Graph). */
  meta: { title: string; description: string; keywords: readonly string[]; ogImageAlt: string };
  /** Link "Saltar al contenido" para teclado y lectores de pantalla. */
  skipLink: string;
  /**
   * La marca del nav: el nombre en dos renglones. Sin alt del logo: en el nav el
   * logo es decorativo (`alt=""`), porque el link ya dice la marca al lado.
   */
  brand: { name: string; tagline: string };
  /**
   * El nav: su nombre accesible, los links a las secciones del home y el texto
   * del CTA de WhatsApp. Los links son `/#id` (`homeAnchorTo`) para que
   * funcionen desde cualquier página, no solo desde el home.
   */
  nav: { ariaLabel: string; links: readonly NavLinkContent[]; cta: string };
  /**
   * Botón flotante de WhatsApp: es solo un ícono, así que su nombre va en
   * `aria-label`. `regionLabel` nombra el `<aside>` que lo contiene: está fuera
   * del nav, del main y del footer, y sin landmark propio quedaría suelto.
   */
  floatingWhatsApp: { ariaLabel: string; regionLabel: string };
};

/**
 * Los textos del chrome. Los que repiten el nombre de la marca (título y
 * keywords) salen de `SITE`, así un cambio de marca no deja un texto
 * desactualizado.
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
  },
  nav: {
    ariaLabel: 'Navegación principal',
    links: [
      { label: 'Viajes', href: homeAnchorTo('trips') },
      { label: 'Calendario', href: homeAnchorTo('calendar') },
      { label: 'Quiénes somos', href: homeAnchorTo('team') },
      { label: 'Preguntas frecuentes', href: homeAnchorTo('faq') },
    ],
    cta: 'Escribinos',
  },
  floatingWhatsApp: {
    ariaLabel: 'Escribinos por WhatsApp',
    regionLabel: 'Contacto rápido',
  },
};
