import { LinkButton } from '@/components/atoms/Button';
import { Tag } from '@/components/atoms/Tag';
import { WashedImage } from '@/components/atoms/WashedImage';
import type { TripCardContent } from '@/content/sections/trips';
import { skew, tilt } from '@/motion/attributes';

import styles from './TripCard.module.css';

/**
 * `sizes` de la foto: la card mide `min(80vw, 400px)`, así que por debajo de
 * 500px de viewport la foto ocupa el 80% del ancho y por encima, 400px fijos.
 */
const PHOTO_SIZES = '(max-width: 500px) 80vw, 400px';

/** Props de `TripCard`: la card ya resuelta por el contenido. */
export type TripCardProps = {
  /** El viaje (con su foto) y el CTA. */
  card: TripCardContent;
};

/**
 * Card de un viaje en el riel horizontal de "Próximos viajes" (`dc.html:116-133`).
 *
 * Es el `.card.elev-md` del design system con dos efectos del motor sobre el
 * mismo `<article>`: se inclina siguiendo al cursor (`tilt()`, con zoom de la
 * foto) y se deforma con la velocidad del scroll mientras el riel corre
 * (`skew()`). Los dos escriben `transform`; el motor saltea el skew de la card
 * que el tilt tiene inclinada.
 *
 * Los textos salen del viaje (`Trip`): duración, dificultad, distancia y precio
 * se formatean en el dominio, no acá.
 */
export function TripCard({ card }: TripCardProps) {
  const { trip, cta } = card;

  return (
    <article className={styles.card} {...tilt()} {...skew()}>
      <WashedImage photo={trip.photo} sizes={PHOTO_SIZES} zoomOnTilt className={styles.photo} />
      <div className={styles.body}>
        <p className={styles.destination}>{trip.destination}</p>
        <h3 className={styles.name}>{trip.name}</h3>
        <ul className={styles.tags}>
          <li className={styles.tagItem}>
            <Tag variant="neutral">{trip.duration.label()}</Tag>
          </li>
          <li className={styles.tagItem}>
            <Tag variant="accent-2">{trip.difficultyLabel()}</Tag>
          </li>
          <li className={styles.tagItem}>
            <Tag variant="outline">{trip.distanceLabel()}</Tag>
          </li>
        </ul>
        <div className={styles.footer}>
          <p className={styles.price}>{trip.price.label()}</p>
          <LinkButton variant="primary" href={cta.href} external={cta.external}>
            {cta.label}
          </LinkButton>
        </div>
      </div>
    </article>
  );
}
