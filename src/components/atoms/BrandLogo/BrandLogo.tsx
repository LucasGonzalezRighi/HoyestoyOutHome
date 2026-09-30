import Image from 'next/image';
import type { ComponentPropsWithoutRef } from 'react';

import { BRAND_LOGO } from '@/constants/assets';
import { cn } from '@/utils/cn';

import styles from './BrandLogo.module.css';

/** Props de `BrandLogo`. Acepta cualquier atributo de `<img>` (ahí van los `data-*` del reveal). */
export type BrandLogoProps = {
  /** Ancho en px. El alto sale de la proporción del PNG (149 × 172). */
  width: number;
  /** Texto alternativo, desde `content/`. */
  alt: string;
  className?: string;
  /** Precarga la imagen (`preload` de `next/image`). Solo si está sobre el fold. */
  priority?: boolean;
} & Omit<
  ComponentPropsWithoutRef<'img'>,
  'src' | 'srcSet' | 'alt' | 'width' | 'height' | 'loading' | 'className'
>;

/**
 * Logo de la marca (nav, telón, cierre).
 *
 * El PNG tiene fondo blanco, así que se muestra con `mix-blend-mode: multiply`:
 * el blanco toma el color de lo que tiene detrás y el logo se asienta sobre el
 * crema como si fuera transparente. Si el logo va sobre una chapita de fondo
 * propio sobre un fondo oscuro (el cierre), quien lo usa pisa el modo con
 * `mix-blend-mode: normal`: multiplicado contra el verde se oscurecería entero.
 */
export function BrandLogo({ width, alt, className, priority = false, ...rest }: BrandLogoProps) {
  const height = Math.round((width * BRAND_LOGO.height) / BRAND_LOGO.width);

  return (
    <Image
      src={BRAND_LOGO.src}
      width={width}
      height={height}
      alt={alt}
      preload={priority}
      className={cn(styles.logo, className)}
      {...rest}
    />
  );
}
