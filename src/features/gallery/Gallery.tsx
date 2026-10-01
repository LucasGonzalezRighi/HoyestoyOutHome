import { Container } from '@/components/atoms/Container';
import { Section } from '@/components/atoms/Section';
import { WashedImage } from '@/components/atoms/WashedImage';
import { SectionHeading } from '@/components/molecules/SectionHeading';
import { Marquee, MarqueePauseGroup } from '@/components/organisms/Marquee';
import { EXTERNAL_LINK_PROPS } from '@/constants/links';
import type { GalleryContent } from '@/content/sections/gallery';
import { reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './Gallery.module.css';

/**
 * `sizes` de cada foto, que mide `clamp(220px, 26vw, 360px)` de ancho
 * (`dc.html:353`): 26vw llega a 220px con un viewport de ~846px y a 360px con
 * uno de ~1385px. Van como media queries porque no todos los navegadores
 * aceptan `clamp()` dentro de `sizes`.
 */
const PHOTO_SIZES = '(max-width: 846px) 220px, (max-width: 1385px) 26vw, 360px';

/** Props de `Gallery`: solo su slice de contenido. */
export type GalleryProps = {
  /** `landingContent.gallery`. */
  content: GalleryContent;
};

/**
 * Sección 12, "Postales del camino" (`dc.html:346-359`): dos cintas de fotos
 * que ocupan todo el ancho de la pantalla, cada una hacia un lado.
 *
 * Las filas alternan: la primera corre hacia la izquierda y sus fotos giran en
 * sentido horario en hover; la segunda, al revés (`data-marquee="1"` / `"-1"`
 * y `rotate(1.5deg)` / `rotate(-1.5deg)`, `dc.html:352-357`).
 *
 * Un solo botón, debajo, pausa las dos filas (`MarqueePauseGroup`; no está en
 * el diseño, CLAUDE.md §9, WCAG 2.2.2).
 */
export function Gallery({ content }: GalleryProps) {
  const { profileLink } = content;

  return (
    <Section aria-label={content.ariaLabel} className={styles.gallery}>
      <Container className={styles.header}>
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          titleClassName={styles.title}
        />
        <a
          href={profileLink.href}
          className={styles.profileLink}
          {...(profileLink.external ? EXTERNAL_LINK_PROPS : {})}
          {...reveal('right')}
        >
          {profileLink.label}
        </a>
      </Container>
      <MarqueePauseGroup
        pauseLabel={content.marqueePauseLabel}
        resumeLabel={content.marqueeResumeLabel}
        controlsClassName={styles.controls}
      >
        <div className={styles.rows}>
          {content.rows.map((photos, rowIndex) => {
            const isForward = rowIndex % 2 === 0;
            return (
              <Marquee
                // Las filas son fijas y no se reordenan: el índice es una clave estable.
                key={rowIndex}
                as="ul"
                items={photos}
                direction={isForward ? 1 : -1}
                className={cn(styles.rail, isForward ? styles.railForward : styles.railBackward)}
                renderItem={(photo, { isClone }) => (
                  // La copia de la cinta no se lee: el lector de pantalla ya leyó la original.
                  <li className={styles.tile} aria-hidden={isClone || undefined}>
                    <WashedImage
                      photo={photo}
                      sizes={PHOTO_SIZES}
                      className={styles.photo}
                      imageClassName={styles.photoImage}
                    />
                  </li>
                )}
              />
            );
          })}
        </div>
      </MarqueePauseGroup>
    </Section>
  );
}
