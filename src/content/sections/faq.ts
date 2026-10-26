import type { FaqRecord, HomeTextsRecord } from '@/content/records/schema';
import type { CallToAction, SectionHeadingContent } from '@/content/types';
import { whatsapp } from '@/content/whatsapp';

/**
 * Una pregunta frecuente y su respuesta.
 *
 * Es un tipo plano (CLAUDE.md §4.5): solo dato. La respuesta es texto corrido,
 * sin links ni formato, porque la renderiza un Client Component (el acordeón)
 * y tiene que poder cruzar la frontera servidor → cliente tal cual.
 */
export type FaqEntry = {
  /** La pregunta, en la voz de quien consulta ("¿Puedo ir solo o sola?"). */
  readonly question: string;
  /** La respuesta: de una a tres oraciones. */
  readonly answer: string;
};

/**
 * El cierre de la sección, la "cumbre" donde termina el sendero de preguntas:
 * invita a escribir si la duda no estaba en la lista.
 */
export type FaqSummitContent = {
  /** La frase grande del cierre. */
  readonly title: string;
  /** Por dónde escribir y qué pasa después. */
  readonly lead: string;
  /** El botón a WhatsApp. */
  readonly cta: CallToAction;
};

/**
 * Textos de "Preguntas frecuentes" (sección nueva del home, pedida por el
 * cliente en octubre de 2026: no está en el diseño).
 */
export type FaqContent = Required<SectionHeadingContent> & {
  /** Bajada: de qué hablan las preguntas, en un renglón o dos. */
  readonly lead: string;
  /** Las preguntas, en el orden en que se muestran. */
  readonly entries: readonly FaqEntry[];
  /** El cierre, después de la última pregunta. */
  readonly summit: FaqSummitContent;
};

/**
 * Contenido de "Preguntas frecuentes". Las preguntas y los textos de la
 * sección se editan desde el panel. Las respuestas que empiezan con
 * `[confirmar]` dependen de condiciones que el cliente todavía no pasó.
 */
export function faqContent(
  records: readonly FaqRecord[],
  texts: HomeTextsRecord['faq'],
): FaqContent {
  return {
    eyebrow: 'Preguntas frecuentes',
    title: texts.title,
    lead: texts.lead,
    entries: records.map(({ question, answer }) => ({ question, answer })),
    summit: {
      title: texts.summitTitle,
      lead: texts.summitLead,
      cta: { label: 'Escribinos por WhatsApp', href: whatsapp.href(), external: true },
    },
  };
}
