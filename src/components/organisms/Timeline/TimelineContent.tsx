import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { Tag } from '@/components/atoms/Tag';
import { WashedImage, type WashedImagePhoto } from '@/components/atoms/WashedImage';
import { cn } from '@/utils/cn';

import styles from './Timeline.module.css';

/*
 * Piezas para el cuerpo de un `TimelineItem`, con las medidas del cronograma
 * del diseño. Son opcionales: un ítem acepta cualquier nodo como hijo, pero
 * con estas el itinerario de cada viaje y el calendario se ven iguales.
 */

/** Props de `TimelineText`. Acepta cualquier atributo de `<p>`. */
export type TimelineTextProps = {
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLParagraphElement>, 'className' | 'children'>;

/**
 * Párrafo de un ítem (`dc.html:169`): la descripción del día, o el rango de
 * fechas y el destino de una salida. Uno por párrafo.
 */
export function TimelineText({ className, children, ...rest }: TimelineTextProps) {
  return (
    <p className={cn(styles.text, className)} {...rest}>
      {children}
    </p>
  );
}

/** Props de `TimelineTags`. */
export type TimelineTagsProps = {
  /** Los datos cortos, en orden: `["4 km", "280 m desnivel", "2 hs de marcha"]`. Cada uno, una sola vez. */
  items: readonly string[];
  className?: string;
};

/**
 * Fila de tags con contorno dorado (`dc.html:171-173`): las métricas del día.
 * Es una lista (`<ul>`). Con `items` vacío no renderiza nada, así quien la usa
 * no tiene que preguntar antes.
 */
export function TimelineTags({ items, className }: TimelineTagsProps) {
  if (items.length === 0) return null;

  return (
    <ul className={cn(styles.tags, className)}>
      {items.map((item) => (
        <li key={item} className={styles.tagItem}>
          <Tag variant="outline" className={styles.tag}>
            {item}
          </Tag>
        </li>
      ))}
    </ul>
  );
}

/**
 * La foto que recibe `TimelinePhoto`: la de `WashedImage` más su proporción.
 * Una instancia de `Photo` (`content/media.ts`) lo cumple tal cual.
 */
export type TimelinePhotoSource = WashedImagePhoto & {
  /** `"ancho / alto"` del archivo (`photo.aspectRatio`). Sin él, 3 / 2. */
  aspectRatio?: string;
};

/** Props de `TimelinePhoto`. */
export type TimelinePhotoProps = {
  photo: TimelinePhotoSource;
  /** `sizes` de `next/image`. Por defecto, el ancho de la columna de la línea (ver `TIMELINE_PHOTO_SIZES`). */
  sizes?: string;
  className?: string;
};

/**
 * `sizes` por defecto de `TimelinePhoto`. En mobile la foto ocupa la columna
 * de texto (el viewport menos los márgenes y los 64px del riel: menos de
 * 100vw); en escritorio, como mucho los 640px de `.photo`.
 */
const TIMELINE_PHOTO_SIZES = '(max-width: 820px) 100vw, 640px';

/** La proporción viaja como custom property: el `aspect-ratio` del marco lo arma el CSS. */
type PhotoRatioStyle = CSSProperties & Record<'--photo-ratio', string>;

/**
 * Foto de un ítem: la foto del día en el itinerario de Lago Lolog (en el
 * diseño, cada etapa es una card apilada con su foto al lado; acá la foto va
 * dentro de la línea, debajo del texto del día).
 *
 * Lavada como el resto de las fotos, con la proporción del archivo, hasta
 * 640px de ancho y 520px de alto (el mismo tope que tienen al imprimir,
 * CLAUDE.md §9.5): una foto vertical se recorta al tope, centrada en su encuadre.
 */
export function TimelinePhoto({
  photo,
  sizes = TIMELINE_PHOTO_SIZES,
  className,
}: TimelinePhotoProps) {
  const ratioStyle: PhotoRatioStyle | undefined = photo.aspectRatio
    ? { '--photo-ratio': photo.aspectRatio }
    : undefined;

  return (
    <WashedImage
      photo={photo}
      sizes={sizes}
      className={cn(styles.photo, className)}
      style={ratioStyle}
    />
  );
}
