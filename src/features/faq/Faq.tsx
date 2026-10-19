import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { SECTION_IDS } from '@/constants/sections';
import type { FaqContent } from '@/content/sections/faq';
import { reveal } from '@/motion/attributes';

import { FaqAccordion } from './components/FaqAccordion';
import { FaqSummit } from './components/FaqSummit';
import styles from './Faq.module.css';

/** `id` del título: le da nombre accesible a la sección (`aria-labelledby`). */
const TITLE_ID = `${SECTION_IDS.faq}-titulo`;

/** Props de `Faq`: solo su slice de contenido. */
export type FaqProps = {
  /** `landingContent.faq`. */
  content: FaqContent;
};

/**
 * "Preguntas frecuentes" como un **sendero a la cumbre** (pedido del cliente,
 * octubre 2026: centrada, sin costados vacíos y "más de montaña"). Es el
 * destino del link "Preguntas frecuentes" del nav (`/#preguntas`).
 *
 * - Va sobre el fondo general de la página: las curvas de nivel
 *   (`ContourLines`, en el layout) que cubren todo el sitio.
 * - El encabezado centrado y, debajo, las preguntas en una sola columna.
 * - El sendero (lo dibuja `FaqAccordion`): una línea punteada que baja por la
 *   izquierda de las tarjetas, con un mojón por pregunta, y que se pinta de
 *   verde con el scroll (`timelineFill()`, como la línea de tiempo del
 *   Calendario). Termina en la "cumbre" (`FaqSummit`), con el botón a WhatsApp.
 *
 * El sendero pintado es el único movimiento propio de la sección; el resto
 * responde a un clic (abrir una pregunta) o es la entrada de siempre.
 *
 * Server Component: el único pedazo cliente es el acordeón (`FaqAccordion`),
 * que tiene estado (la pregunta abierta).
 */
export function Faq({ content }: FaqProps) {
  const { eyebrow, title, lead, entries, summit } = content;

  return (
    <Section id={SECTION_IDS.faq} spacing="none" className={styles.band} aria-labelledby={TITLE_ID}>
      <Container>
        <div className={styles.intro}>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            titleId={TITLE_ID}
            titleClassName={styles.title}
          />
          <p className={styles.lead} {...reveal('up', { delay: 2 })}>
            {lead}
          </p>
        </div>

        <div className={styles.trail}>
          <FaqAccordion entries={entries} />
          <FaqSummit content={summit} />
        </div>
      </Container>
    </Section>
  );
}
