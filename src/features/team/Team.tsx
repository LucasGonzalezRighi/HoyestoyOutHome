import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { SECTION_IDS } from '@/constants/sections';
import type { TeamContent } from '@/content/sections/team';
import { reveal } from '@/motion/attributes';

import { GuideCard } from './components/GuideCard';
import styles from './Team.module.css';

/** Props de `Team`: solo su slice de contenido. */
export type TeamProps = {
  /** `landingContent.team`. */
  content: TeamContent;
};

/**
 * Sección 10, "¿Quiénes somos?" (`dc.html:314-328`): quiénes arman las
 * travesías y un link al Instagram de cada guía.
 *
 * Es el destino del link "Quiénes somos" del nav (`#equipo`).
 *
 * Coreografía del diseño: el eyebrow entra desde la izquierda, el título y la
 * bajada suben escalonados (1 y 2) y cada guía crece un escalón después del
 * anterior (`data-rv="scale" data-rv-d="{{ $index }}"`).
 */
export function Team({ content }: TeamProps) {
  return (
    <Section id={SECTION_IDS.team}>
      <Container>
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          titleClassName={styles.title}
        />
        <p className={styles.lead} {...reveal('up', { delay: 2 })}>
          {content.lead}
        </p>
        <ul className={styles.guides}>
          {content.guides.map((guide, index) => (
            <li key={guide.instagramHandle}>
              <GuideCard guide={guide} {...reveal('scale', { delay: index })} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
