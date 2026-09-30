import { Section } from '@/components/atoms/Section';
import { WashedImage, type WashedImageParallax } from '@/components/atoms/WashedImage';
import type { MountainBannerContent } from '@/content/sections/mountain-banner';
import { reveal } from '@/motion/attributes';

import styles from './MountainBanner.module.css';

/**
 * Cuánto dura la entrada de la banda: el 70% del viewport (`data-rv-span="0.7"`,
 * `dc.html:215`). Mucho más lenta que la de un texto (0.16) porque la banda
 * ocupa casi toda la pantalla: se expande mientras se scrollea hacia ella.
 */
const FRAME_REVEAL_SPAN = 0.7;

/**
 * Parallax de la foto (`dc.html:216`): `data-parallax="0.25"` sobre una `<img>`
 * con `top: -15%; height: 130%`. Al estar en una `<img>`, el motor del diseño
 * le sumaba el zoom de la intro; acá se pide explícito con `introZoom`.
 */
const PHOTO_PARALLAX: WashedImageParallax = {
  factor: 0.25,
  overscanTop: '-15%',
  overscanHeight: '130%',
  introZoom: true,
};

/** La foto cubre todo el ancho del viewport (menos un margen de 10–24px). */
const PHOTO_SIZES = '100vw';

/** Props de `MountainBanner`: solo su slice de contenido. */
export type MountainBannerProps = {
  /** `landingContent.mountainBanner`. */
  content: MountainBannerContent;
};

/**
 * Sección 06 — banda "La montaña te espera." (`dc.html:214-222`).
 *
 * Una pausa entre Calle & Stepanek y Lago Lolog: una foto casi a pantalla
 * completa, con parallax, y una frase grande abajo a la izquierda. Va fuera
 * del `Container` a propósito: en el diseño está entre dos `<main>` y ocupa
 * todo el ancho, con apenas un margen lateral.
 *
 * Dos animaciones que no se pisan porque van en elementos distintos: el marco
 * se expande al entrar (`reveal('expand')`) y la capa de la foto hace parallax
 * adentro (`WashedImage`). La frase entra con `reveal('zoom')`, creciendo
 * desde su esquina inferior izquierda.
 */
export function MountainBanner({ content }: MountainBannerProps) {
  return (
    <Section aria-label={content.ariaLabel}>
      <div className={styles.frame} {...reveal('expand', { span: FRAME_REVEAL_SPAN })}>
        <WashedImage
          photo={content.photo}
          sizes={PHOTO_SIZES}
          parallax={PHOTO_PARALLAX}
          className={styles.photo}
        />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.caption}>
          <p className={styles.phrase} {...reveal('zoom')}>
            {content.phrase}
          </p>
        </div>
      </div>
    </Section>
  );
}
