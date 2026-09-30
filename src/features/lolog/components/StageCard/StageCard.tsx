import type { CSSProperties } from 'react';

import { Tag } from '@/components/atoms/Tag';
import { WashedImage } from '@/components/atoms/WashedImage';
import type { LologItineraryContent } from '@/content/sections/lolog';
import type { ItineraryStage } from '@/domain';
import { stackCard } from '@/motion/attributes';

import styles from './StageCard.module.css';

/**
 * Cuánto más abajo se fija cada card respecto de la anterior: 14px por etapa
 * (`offset: 0, 14, 28, 42, 56` en el array `itinerario`, `dc.html:691-695`).
 * Así, cuando se apilan, asoma el borde de arriba de cada una.
 */
const STACK_OFFSET_STEP_PX = 14;

/**
 * La foto ocupa la mitad derecha de la card (el ancho de contenido llega a
 * 1096px) y todo el ancho en mobile.
 */
const PHOTO_SIZES = '(max-width: 820px) 100vw, (max-width: 1240px) 45vw, 550px';

/** El offset viaja como custom property: el `top` sticky lo arma el CSS. */
type StackOffsetStyle = CSSProperties & Record<'--stack-offset', string>;

/** La proporción de la foto viaja como custom property: el `aspect-ratio` del marco lo arma el CSS. */
type PhotoRatioStyle = CSSProperties & Record<'--photo-ratio', string>;

/** Props de `StageCard`. */
export type StageCardProps = {
  /** La etapa del itinerario: día, tramo, texto, métricas y foto. */
  stage: ItineraryStage;
  /** Posición en la pila (0 = la primera). Define cuánto más abajo se fija. */
  index: number;
  /** Prefijos de los tags ("Distancia:", "Desnivel:"). */
  metricLabels: LologItineraryContent['metricLabels'];
};

/**
 * Una etapa del itinerario de Lago Lolog (`dc.html:249-266`): texto a la
 * izquierda, foto a la derecha.
 *
 * Son dos capas por cómo trabaja el motor: el `<li>` es el envoltorio sticky
 * marcado con `stackCard()`, y el motor transforma a su **primer hijo** (el
 * `<article>`), que se achica, gira y oscurece cuando la card siguiente se le
 * sube encima. Por eso el `<article>` tiene que ser el primer hijo del `<li>`.
 */
export function StageCard({ stage, index, metricLabels }: StageCardProps) {
  const offsetStyle: StackOffsetStyle = {
    '--stack-offset': `${index * STACK_OFFSET_STEP_PX}px`,
  };
  const photoRatioStyle: PhotoRatioStyle = { '--photo-ratio': stage.photo.aspectRatio };

  return (
    <li className={styles.wrapper} style={offsetStyle} {...stackCard()}>
      <article className={styles.card}>
        <div className={styles.body}>
          {/*
            Día y tramo son el título de la card: h4 debajo del h3 "Itinerario".
            El espacio entre los dos `<span>` es para el nombre accesible
            ("Día 1 Puerto Arturo…"); en pantalla no se ve, porque un espacio
            suelto entre ítems flex no se renderiza (la separación es el gap).
          */}
          <h4 className={styles.heading}>
            <span className={styles.day}>{stage.dayLabel()}</span>{' '}
            <span className={styles.route}>{stage.route}</span>
          </h4>
          {stage.paragraphs.map((paragraph) => (
            <p key={paragraph} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
          {stage.hasMetrics ? (
            <ul className={styles.metrics}>
              <li className={styles.metric}>
                <Tag variant="accent-2">
                  {metricLabels.distance} {stage.distanceLabel()}
                </Tag>
              </li>
              <li className={styles.metric}>
                <Tag variant="accent">
                  {metricLabels.elevation} {stage.elevationLabel()}
                </Tag>
              </li>
            </ul>
          ) : null}
        </div>
        <WashedImage
          photo={stage.photo}
          sizes={PHOTO_SIZES}
          className={styles.photo}
          style={photoRatioStyle}
        />
      </article>
    </li>
  );
}
