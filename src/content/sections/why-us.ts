import type { HomeTextsRecord } from '@/content/records/schema';
import type { SectionHeadingContent } from '@/content/types';

/**
 * Un pilar de "Por qué viajar con nosotros": título y bajada.
 *
 * Es un tipo plano y no una clase a propósito (CLAUDE.md §4.5): es solo dato,
 * no tiene invariantes ni comportamiento que encapsular.
 */
export type WhyUsPillar = {
  /** Título del pilar ("Guías habilitados"). */
  readonly title: string;
  /** Bajada de una o dos líneas debajo del título. */
  readonly description: string;
};

/**
 * Textos de la sección 02 "Por qué viajar con nosotros" (`dc.html:90-104`).
 *
 * El eyebrow es obligatorio acá (el diseño lo trae), por eso el `Required`.
 */
export type WhyUsContent = Required<SectionHeadingContent> & {
  /** Nombre accesible de la sección (`aria-label` del `<section>` en el diseño). */
  readonly ariaLabel: string;
  /** Los cuatro pilares, en el orden en que se muestran. */
  readonly pillars: readonly WhyUsPillar[];
};

/**
 * Contenido de "Por qué viajar con nosotros". Título y pilares se editan desde
 * el panel; el texto inicial es el del diseño (`dc.html:90-104`).
 */
export function whyUsContent(texts: HomeTextsRecord['whyUs']): WhyUsContent {
  return {
    ariaLabel: 'Por qué viajar con nosotros',
    eyebrow: 'Por qué viajar con nosotros',
    title: texts.title,
    pillars: texts.pillars,
  };
}
