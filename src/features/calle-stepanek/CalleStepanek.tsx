import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { Tag, type TagVariant } from '@/components/atoms/Tag';
import { WashedImage, type WashedImageParallax } from '@/components/atoms/WashedImage';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { SECTION_IDS } from '@/constants/sections';
import type {
  CalleStepanekContent,
  CalleStepanekTagsContent,
} from '@/content/sections/calle-stepanek';
import { reveal } from '@/motion/attributes';

import { AudienceCard } from './components/AudienceCard';
import { RequirementsCard } from './components/RequirementsCard';
import { Schedule } from './components/Schedule';
import styles from './CalleStepanek.module.css';

/**
 * Parallax de la foto sticky (`dc.html:145`): la `<img>` mide el 118% del
 * marco y arranca pegada arriba (sin `top` negativo), así que el overscan
 * entero queda abajo. Es una `<img>` en el diseño, por eso lleva el zoom de
 * la intro.
 */
const PHOTO_PARALLAX = {
  factor: 0.12,
  overscanTop: '0%',
  overscanHeight: '118%',
  introZoom: true,
} as const satisfies WashedImageParallax;

/**
 * `sizes` de la foto sticky. A una columna (≤820px) ocupa el contenedor (el
 * viewport menos el margen lateral, ~90vw); en escritorio, los 5/12 de la
 * grilla menos el gap: ~36vw, y ~430px con el contenedor en su máximo.
 */
const PHOTO_SIZES = '(max-width: 820px) 90vw, (max-width: 1240px) 36vw, 430px';

/**
 * Los tags de la foto, en el orden del diseño y con su tinte (`dc.html:148-150`):
 * duración en dorado, cumbre en verde musgo, dificultad en contorno.
 */
const TRIP_TAGS = [
  { key: 'duration', variant: 'accent' },
  { key: 'summit', variant: 'accent-2' },
  { key: 'difficulty', variant: 'outline' },
] as const satisfies readonly { key: keyof CalleStepanekTagsContent; variant: TagVariant }[];

/**
 * Los párrafos de la presentación entran después del eyebrow (0), el título
 * (1) y la bajada (2): el primero en el escalón 3 (`dc.html:157`).
 */
const FIRST_PARAGRAPH_DELAY = 3;

/** Props de `CalleStepanek`: su slice de `landingContent`. */
export type CalleStepanekProps = {
  /** `landingContent.calleStepanek`: las secciones 04 y 05. */
  content: CalleStepanekContent;
};

/**
 * Secciones 04 "Calle & Stepanek" y 05 "¿Puedo? / ¿Es para mí?"
 * (`dc.html:141-211`), en ese orden y dentro del mismo `Container`, como en el
 * diseño (las dos viven en un mismo `<main>`).
 *
 * - **04** (`#calle`, destino del nav y de la card del viaje): grilla 5/7 con
 *   la foto fija a la izquierda (sticky mientras se lee la columna derecha)
 *   y, a la derecha, la presentación del viaje y el cronograma.
 * - **05**: las dos cards que responden si el viaje es para vos. Es la
 *   continuación de la 04 —sin título propio y con el aire compacto—, por eso
 *   sus títulos son `<h3>` que cuelgan del `<h2>` "Calle & Stepanek".
 *
 * Server Component: todo se anima por atributos (`reveal`, `parallax`,
 * `timelineFill`, `tilt`), así que no hay estado ni efectos acá.
 */
export function CalleStepanek({ content }: CalleStepanekProps) {
  const { overview, schedule, requirements, audience } = content;
  const highlightDelay = FIRST_PARAGRAPH_DELAY + overview.paragraphs.length;

  return (
    <Container>
      <Section id={SECTION_IDS.calleStepanek} className={styles.overview}>
        <div className={styles.media}>
          {/* Se destapa de abajo hacia arriba con `clip-path` (el radio del recorte es el del marco). */}
          <div className={styles.photoFrame} {...reveal('clip')}>
            <WashedImage
              photo={overview.photo}
              sizes={PHOTO_SIZES}
              parallax={PHOTO_PARALLAX}
              className={styles.photo}
            />
          </div>
          <ul className={styles.tags} {...reveal('up', { delay: 2 })}>
            {TRIP_TAGS.map(({ key, variant }) => (
              <li key={key}>
                <Tag variant={variant}>{overview.tags[key]}</Tag>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SectionHeading
            eyebrow={overview.eyebrow}
            title={
              <>
                <span className={styles.titleAccent}>{overview.title.accent}</span>
                {` ${overview.title.rest}`}
              </>
            }
            titleClassName={styles.title}
          />
          <p className={styles.subtitle} {...reveal('up', { delay: 2 })}>
            {overview.subtitle}
          </p>
          {overview.paragraphs.map((paragraph, index) => (
            <p
              key={paragraph}
              className={styles.paragraph}
              {...reveal('up', { delay: FIRST_PARAGRAPH_DELAY + index })}
            >
              {paragraph}
            </p>
          ))}
          <p className={styles.highlight} {...reveal('up', { delay: highlightDelay })}>
            {overview.highlight}
          </p>
          <Schedule content={schedule} />
        </div>
      </Section>

      <Section spacing="compact" className={styles.fit}>
        <RequirementsCard content={requirements} />
        <AudienceCard content={audience} revealDelay={1} />
      </Section>
    </Container>
  );
}
