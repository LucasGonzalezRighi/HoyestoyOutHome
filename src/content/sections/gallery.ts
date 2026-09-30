import { SOCIAL_PROFILES } from '@/constants/site';
import { PHOTOS } from '@/content/media';
import type { CallToAction, SectionHeadingContent } from '@/content/types';
import type { Photo } from '@/domain';

/**
 * Contenido de la sección 12, la galería "Postales del camino"
 * (`dc.html:346-359`; fotos en `gal1` y `gal2` del script, `dc.html:723-724`).
 *
 * El diseño duplica cada fila (`[0, 1].flatMap(…)`) para la cinta infinita.
 * Acá cada foto va una sola vez: la copia la pone el organism `Marquee`.
 */
export type GalleryContent = SectionHeadingContent & {
  /** Nombre de la región para lectores de pantalla (el `aria-label` de la sección). */
  readonly ariaLabel: string;
  /** Link al Instagram de la marca, a la derecha del título. */
  readonly profileLink: CallToAction;
  /** Las dos filas de fotos, en el orden del diseño (`gal1`, `gal2`). */
  readonly rows: readonly [readonly Photo[], readonly Photo[]];
};

const { instagram } = SOCIAL_PROFILES;

/**
 * Textos y fotos de la galería.
 *
 * El diseño deja las fotos con `alt=""`; acá llevan el alt descriptivo del
 * registro (`PHOTOS`): la galería es contenido (son las postales de los
 * viajes), no decoración.
 */
export const galleryContent: GalleryContent = {
  ariaLabel: 'Galería',
  title: 'Postales del camino',
  profileLink: {
    label: `@${instagram.handle}`,
    href: instagram.url,
    external: true,
  },
  rows: [
    [
      PHOTOS.volcanicTrailAscent,
      PHOTOS.rockFlowers,
      PHOTOS.summitMate,
      PHOTOS.snowyPeakClouds,
      PHOTOS.summitCross,
      PHOTOS.lakeshoreRest,
    ],
    [
      PHOTOS.mountainStream,
      PHOTOS.screeAscent,
      PHOTOS.lakeshoreHorse,
      PHOTOS.rockyRidgeClimber,
      PHOTOS.valleyDescent,
      PHOTOS.volcanoView,
    ],
  ],
};
