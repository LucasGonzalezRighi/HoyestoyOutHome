import { anchorTo } from '@/constants/sections';
import { PHOTOS } from '@/content/media';
import type { HomeTextsRecord } from '@/content/records/schema';
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

/** El titular del hero (el único `<h1>` del home). */
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

/** Los renglones del titular partidos en palabras: cada una entra con su máscara. */
function headlineLines(lines: readonly string[]): readonly HeroHeadlineLine[] {
  return lines.map((line) => line.split(/\s+/).filter(Boolean));
}

/**
 * Contenido del hero. Titular, bajada y cinta se editan desde el panel
 * (`HomeTextsRecord['hero']`); el texto inicial es el del diseño
 * (`dc.html:57-75` y los arrays `heroLines` y `marquee` de `renderVals()`,
 * `dc.html:659-660`). La foto y los botones son fijos.
 *
 * La frase accesible del titular se arma con los mismos renglones, así no hay
 * dos copias del copy que se puedan desincronizar.
 */
export function heroContent(texts: HomeTextsRecord['hero']): HeroContent {
  return {
    photo: PHOTOS.heroRange,
    headline: { text: texts.headline.join(' '), lines: headlineLines(texts.headline) },
    lead: texts.lead,
    tripsCta: { label: 'Ver próximos viajes', href: anchorTo('trips') },
    contactCta: { label: 'Hablá con nosotros', href: whatsapp.href(), external: true },
    ribbon: texts.ribbon,
  };
}
