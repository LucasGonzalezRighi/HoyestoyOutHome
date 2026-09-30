import { PHOTOS } from '@/content/media';
import type { Photo } from '@/domain';

/**
 * Contenido de la banda "La montaña te espera." (sección 06 del diseño,
 * `docs/design/hoy-estoy-ooh-landing.dc.html:214-222`): una foto a todo el
 * ancho con una sola frase encima. No tiene título: se nombra con `aria-label`.
 */
export type MountainBannerContent = {
  /** Nombre accesible de la sección (`aria-label`, `dc.html:214`). Sin el punto final de la frase. */
  readonly ariaLabel: string;
  /** La frase grande en itálica sobre la foto (`dc.html:219`). */
  readonly phrase: string;
  /** Foto de fondo, con su alt y el encuadre de la banda (`center 62%`). */
  readonly photo: Photo;
};

/** Textos y foto de la banda. */
export const mountainBannerContent: MountainBannerContent = {
  ariaLabel: 'La montaña te espera',
  phrase: 'La montaña te espera.',
  // El encuadre base de esta foto en el registro ya es el de la banda (`center 62%`, `dc.html:216`).
  photo: PHOTOS.summitAboveClouds,
};
