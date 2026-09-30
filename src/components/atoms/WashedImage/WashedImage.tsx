import Image from 'next/image';
import type { CSSProperties, HTMLAttributes } from 'react';

import { parallax as parallaxAttributes, tiltZoom } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './WashedImage.module.css';

/**
 * Lo mínimo que hace falta de una foto. Es un tipo estructural a propósito:
 * `components/` no conoce el dominio, pero una instancia de `Photo`
 * (`content/media.ts`) lo cumple tal cual y se pasa directo.
 */
export type WashedImagePhoto = {
  /** Ruta dentro de `public/`. */
  src: string;
  /** Texto alternativo. Vacío si la foto es decorativa (galería). */
  alt: string;
  /** Encuadre (`object-position`), p. ej. `'center 62%'`. Por defecto, centrado. */
  position?: string;
};

/** Tratamiento de color de la foto. */
export type WashedImageTone =
  /** `.washed` del design system: desaturada y aclarada. La de casi todas las fotos. */
  | 'washed'
  /** Casi sin lavar: la foto del hero, que tiene que leerse viva detrás del titular. */
  | 'vivid'
  /** Sin filtro. */
  | 'none';

/**
 * Parallax de la foto. La imagen va dentro de una capa más alta que el marco
 * (el "overscan"), y el motor traslada esa capa en Y según la posición del
 * marco en el viewport. El overscan tiene que alcanzar para que el
 * desplazamiento nunca deje ver el borde de la capa.
 */
export type WashedImageParallax = {
  /** Fracción del desplazamiento (0.4 en el hero, 0.25 en la banda, 0.12 en Calle & Stepanek). */
  factor: number;
  /** `top` de la capa respecto del marco, p. ej. `'-10%'` (hero). */
  overscanTop: string;
  /** Alto de la capa respecto del marco, p. ej. `'122%'` (hero). */
  overscanHeight: string;
  /** Arranca con zoom y lo suelta durante la intro del telón (fotos sobre el fold). */
  introZoom?: boolean;
};

const TONE_CLASSES: Record<WashedImageTone, string | undefined> = {
  washed: styles.washed,
  vivid: styles.vivid,
  none: undefined,
};

/** Custom properties con las que la capa de parallax recibe su overscan. */
type OverscanStyle = CSSProperties &
  Record<'--parallax-overscan-top' | '--parallax-overscan-height', string>;

/** Props de `WashedImage`. El resto de los atributos va al marco (ahí van los `data-*` del reveal). */
export type WashedImageProps = {
  photo: WashedImagePhoto;
  /** `sizes` de `next/image`: cuánto ocupa la foto en cada viewport. Obligatorio porque la imagen es `fill`. */
  sizes: string;
  /** Por defecto `washed`. */
  tone?: WashedImageTone;
  /** Precarga la foto (`preload` de `next/image`). Solo para la foto que es el LCP (hero). */
  priority?: boolean;
  parallax?: WashedImageParallax;
  /** La foto hace zoom mientras su card `tilt()` está inclinada (cards de viaje). */
  zoomOnTilt?: boolean;
  /** Clase del marco: radio, alto o `aspect-ratio` los decide quien lo usa. */
  className?: string;
  /** Clase de la `<img>`, para efectos de hover (zoom de la galería). */
  imageClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;

/**
 * Foto de contenido, con el lavado del design system (`.washed`).
 *
 * El marco recorta (`overflow: hidden`) y la foto lo llena con `object-fit:
 * cover`. El tamaño del marco lo pone quien lo usa, así el mismo átomo sirve
 * para el fondo del hero, una card o una baldosa de la galería.
 */
export function WashedImage({
  photo,
  sizes,
  tone = 'washed',
  priority = false,
  parallax,
  zoomOnTilt = false,
  className,
  imageClassName,
  ...rest
}: WashedImageProps) {
  const image = (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      preload={priority}
      className={cn(styles.image, zoomOnTilt && styles.tiltZoom, imageClassName)}
      style={photo.position ? { objectPosition: photo.position } : undefined}
      {...(zoomOnTilt ? tiltZoom() : {})}
    />
  );

  return (
    <div className={cn(styles.frame, TONE_CLASSES[tone], className)} {...rest}>
      {parallax ? (
        <div
          className={styles.parallaxLayer}
          style={overscanStyle(parallax)}
          {...parallaxAttributes(parallax.factor, { introZoom: parallax.introZoom })}
        >
          {image}
        </div>
      ) : (
        image
      )}
    </div>
  );
}

/**
 * El overscan viaja como custom properties y no como `top`/`height` inline:
 * así el CSS del módulo sigue siendo el dueño del layout de la capa.
 */
function overscanStyle({ overscanTop, overscanHeight }: WashedImageParallax): OverscanStyle {
  return {
    '--parallax-overscan-top': overscanTop,
    '--parallax-overscan-height': overscanHeight,
  };
}
