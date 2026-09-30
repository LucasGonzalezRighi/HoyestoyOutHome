import { anchorTo } from '@/constants/sections';
import { SITE } from '@/constants/site';
import { PHOTOS } from '@/content/media';
import type { CallToAction } from '@/content/types';
import { whatsapp } from '@/content/whatsapp';
import type { Photo } from '@/domain';

/**
 * Un renglón del titular, palabra por palabra.
 *
 * El titular llega partido porque cada palabra entra por separado, desde
 * detrás de su propia máscara (`heroLines` del diseño, `dc.html:659`). Los
 * signos van pegados a su palabra (`'esencial.'`), como en el diseño.
 */
export type HeroHeadlineLine = readonly string[];

/** El titular del hero (el único `<h1>` de la página). */
export type HeroHeadlineContent = {
  /**
   * La frase entera, de corrido. Es el nombre accesible del `<h1>`: las
   * palabras partidas en máscaras se ocultan a los lectores de pantalla para
   * que no lean "Creo… experiencias… en…" de a una.
   */
  readonly text: string;
  /** Los renglones, en el orden en que entran. En escritorio cada uno va en una sola línea. */
  readonly lines: readonly HeroHeadlineLine[];
};

/**
 * Textos y datos de la sección 01 Hero y de la cinta que la sigue
 * (`dc.html:54-86`).
 */
export type HeroContent = {
  /** Foto de fondo, con su alt (la del diseño: "Cordón de montañas en Mendoza"). */
  readonly photo: Photo;
  /**
   * Texto calado gigante que se desliza de costado con el scroll. Es
   * decorativo (`aria-hidden`): repite la marca, no agrega información.
   */
  readonly outlineText: string;
  /**
   * Titular "Creo experiencias en la montaña / para reconectar con lo
   * esencial.": dos renglones que entran palabra por palabra con la intro.
   */
  readonly headline: HeroHeadlineContent;
  /**
   * Bajada, un renglón por elemento. En escritorio cada renglón va entero en
   * una línea, alineado a la derecha (`dc.html:72`).
   */
  readonly lead: readonly string[];
  /** "Ver próximos viajes": ancla a la sección de viajes. */
  readonly tripsCta: CallToAction;
  /** "Hablá con nosotros": abre el chat de WhatsApp con el mensaje por defecto. */
  readonly contactCta: CallToAction;
  /**
   * Palabras de la cinta que sigue al hero, **una sola vez**: el organism
   * `Marquee` las duplica (el diseño las repetía con `flatMap`, `dc.html:660`).
   * La cinta entera es decorativa (`aria-hidden`).
   */
  readonly ribbon: readonly string[];
};

/** Renglones del titular: `heroLines` de `renderVals()` (`dc.html:659`). */
const HEADLINE_LINES = [
  ['Creo', 'experiencias', 'en', 'la', 'montaña'],
  ['para', 'reconectar', 'con', 'lo', 'esencial.'],
] as const satisfies readonly HeroHeadlineLine[];

/**
 * Contenido del hero. Copys verbatim del diseño: el marcado (`dc.html:57-75`)
 * y los arrays `heroLines` y `marquee` de `renderVals()` (`dc.html:659-660`).
 *
 * La frase accesible del titular se arma con los mismos renglones, así no hay
 * dos copias del copy que se puedan desincronizar.
 */
export const heroContent: HeroContent = {
  photo: PHOTOS.heroRange,
  outlineText: 'Out Of Home · Out Of Home',
  headline: {
    text: HEADLINE_LINES.map((line) => line.join(' ')).join(' '),
    lines: HEADLINE_LINES,
  },
  lead: [
    'Trekkings y ascensos guiados por Mendoza y la Patagonia.',
    'Grupos chicos, atención personalizada y la montaña de verdad.',
  ],
  tripsCta: { label: 'Ver próximos viajes', href: anchorTo('trips') },
  contactCta: { label: 'Hablá con nosotros', href: whatsapp.href(), external: true },
  ribbon: [
    'Tu primer 4mil',
    'Huella Andina',
    'Mendoza',
    'Neuquén',
    'Grupos reducidos',
    // El nombre de la marca sale de `SITE`: si cambia, la cinta no queda vieja.
    SITE.name,
  ],
};
