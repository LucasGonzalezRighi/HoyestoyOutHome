import { ArrowLeft } from 'lucide-react';

import { LinkButton } from '@/components/atoms/Button';
import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon';
import { Container } from '@/components/atoms/Container';
import { Eyebrow } from '@/components/atoms/Eyebrow';
import { Tag, type TagVariant } from '@/components/atoms/Tag';
import { WashedImage, type WashedImageParallax } from '@/components/atoms/WashedImage';
import type { TripCoverContent, TripTagKind } from '@/content/trips';
import { navOverlay, reveal } from '@/motion/attributes';

import styles from './TripCover.module.css';

/**
 * Parallax de la foto: el mismo del hero del home (`dc.html:57`). La capa
 * arranca un 10% más arriba y mide 122% del marco para que el desplazamiento
 * nunca deje ver su borde, y suelta el zoom de arranque con la intro.
 */
const BACKGROUND_PARALLAX: WashedImageParallax = {
  factor: 0.4,
  overscanTop: '-10%',
  overscanHeight: '122%',
  introZoom: true,
};

/**
 * Tinte de cada tag. Sobre la foto van los que tienen fondo propio (el de
 * contorno se perdería): la duración en dorado y la cumbre en verde musgo,
 * como los tags de la foto de Calle & Stepanek (`dc.html:148-150`), y los
 * datos del terreno en neutro.
 */
const TAG_VARIANTS = {
  duration: 'accent',
  summit: 'accent-2',
  difficulty: 'neutral',
  distance: 'neutral',
} as const satisfies Record<TripTagKind, TagVariant>;

/** Lado de los íconos de los botones. */
const ICON_SIZE = 18;

/** Trazo de los íconos: la regla del design system (2.75). */
const ICON_STROKE_WIDTH = 2.75;

/** Props de `TripCover`. */
export type TripCoverProps = {
  /** `tripDetails[slug].cover`. */
  content: TripCoverContent;
};

/**
 * Portada de la página de un viaje: la foto del viaje a sangre, con el mismo
 * parallax y degradé que el hero del home, y encima el título, los datos del
 * catálogo en tags y los dos CTA.
 *
 * Todo entra con la intro (al hidratar), como el hero: está sobre el fold y
 * con el scroll no se vería entrar. La foto lleva `preload` (`priority` de
 * `WashedImage`) porque es el elemento más grande de la primera pantalla.
 *
 * Es un `<header>` dentro del `<main>`: no es el `banner` de la página (ese es
 * el nav), es el encabezado del contenido. Lleva el único `<h1>`.
 */
export function TripCover({ content }: TripCoverProps) {
  const { photo, backLink, eyebrow, title, subtitle, tagsLabel, tags, consultCta, scheduleCta } =
    content;

  return (
    <header className={styles.cover} {...navOverlay()}>
      <WashedImage
        photo={photo}
        tone="vivid"
        priority
        sizes="100vw"
        parallax={BACKGROUND_PARALLAX}
        className={styles.backdrop}
      />
      <div className={styles.shade} aria-hidden="true" />

      <Container className={styles.content}>
        <div {...reveal('left', { intro: true })}>
          <LinkButton
            href={backLink.href}
            variant="secondary"
            tone="inverse"
            icon={<ArrowLeft size={ICON_SIZE} strokeWidth={ICON_STROKE_WIDTH} aria-hidden="true" />}
          >
            {backLink.label}
          </LinkButton>
        </div>

        <div className={styles.body}>
          <Eyebrow className={styles.eyebrow} {...reveal('left', { intro: true, delay: 1 })}>
            {eyebrow}
          </Eyebrow>
          <h1 className={styles.title} {...reveal('up', { intro: true, delay: 2 })}>
            {title.accent ? (
              <>
                <span className={styles.titleAccent}>{title.accent}</span>{' '}
              </>
            ) : null}
            {title.rest}
          </h1>
          {subtitle ? (
            <p className={styles.subtitle} {...reveal('up', { intro: true, delay: 3 })}>
              {subtitle}
            </p>
          ) : null}
          <ul
            className={styles.tags}
            aria-label={tagsLabel}
            {...reveal('up', { intro: true, delay: 4 })}
          >
            {tags.map((tag) => (
              <li key={tag.kind}>
                <Tag variant={TAG_VARIANTS[tag.kind]} className={styles.tag}>
                  {tag.label}
                </Tag>
              </li>
            ))}
          </ul>
          <div className={styles.actions} {...reveal('up', { intro: true, delay: 5 })}>
            <LinkButton
              href={consultCta.href}
              external={consultCta.external}
              variant="primary"
              size="lg"
              icon={<WhatsAppIcon size={ICON_SIZE} />}
            >
              {consultCta.label}
            </LinkButton>
            <LinkButton href={scheduleCta.href} variant="secondary" tone="inverse" size="lg">
              {scheduleCta.label}
            </LinkButton>
          </div>
        </div>
      </Container>
    </header>
  );
}
