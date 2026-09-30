import type { SectionHeadingContent } from '@/content/types';

/**
 * Un pilar de "Por qué viajar con nosotros": número, título y bajada.
 *
 * Es un tipo plano y no una clase a propósito (CLAUDE.md §4.5): es solo dato,
 * no tiene invariantes ni comportamiento que encapsular.
 */
export type WhyUsPillar = {
  /** Número que encabeza la card, tal como se lee: `'01'`…`'04'`. */
  readonly number: string;
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
 * Contenido de "Por qué viajar con nosotros". Copys verbatim del diseño: el
 * marcado (`dc.html:90-92`) y el array `pilares` de `renderVals()` (`dc.html:661-666`).
 */
export const whyUsContent: WhyUsContent = {
  ariaLabel: 'Por qué viajar con nosotros',
  eyebrow: 'Por qué viajar con nosotros',
  title: 'La montaña de verdad, sin que tengas que resolver nada',
  pillars: [
    {
      number: '01',
      title: 'Guías habilitados',
      description: 'Guías de Turismo Aventura y de Montaña, con años de experiencia en el terreno.',
    },
    {
      number: '02',
      title: 'Grupos pequeños',
      description: 'Salidas chicas para ir a tu ritmo, conocernos y disfrutar el camino.',
    },
    {
      number: '03',
      title: 'Logística resuelta',
      description: 'Traslados, refugio o carpas, pensión completa y reuniones previas.',
    },
    {
      number: '04',
      title: 'Seguridad siempre',
      description: 'Botiquín, comunicación VHF, seguro de accidentes y coordinación permanente.',
    },
  ],
};
