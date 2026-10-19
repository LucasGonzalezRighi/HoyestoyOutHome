import { MountainSnow } from 'lucide-react';

import { LinkButton } from '@/components/atoms/Button';
import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon';
import type { FaqSummitContent } from '@/content/sections/faq';
import { reveal } from '@/motion/attributes';

import styles from './FaqSummit.module.css';
import { SUMMIT_RINGS, SUMMIT_RINGS_EXTENT } from './summitRings';

/** Trazo de los íconos: Lucide a 2.75, regla del design system Organic. */
const ICON_STROKE_WIDTH = 2.75;

/** Lado del ícono de la montaña en px: la mitad del círculo que lo contiene (48px). */
const MOUNTAIN_SIZE = 24;

/** Lado de la caja de los anillos. */
const RINGS_SIDE = SUMMIT_RINGS_EXTENT * 2;

/** Caja de los anillos, con el origen en el centro: ahí va la montaña. */
const RINGS_VIEW_BOX = `${-SUMMIT_RINGS_EXTENT} ${-SUMMIT_RINGS_EXTENT} ${RINGS_SIDE} ${RINGS_SIDE}`;

/** Props de `FaqSummit`: solo su parte del contenido de la sección. */
export type FaqSummitProps = {
  /** `landingContent.faq.summit`. */
  content: FaqSummitContent;
};

/**
 * La "cumbre": el cierre de "Preguntas frecuentes", donde termina el sendero.
 * Si la duda no estaba entre las preguntas, acá está el botón a WhatsApp.
 *
 * Es la única tarjeta oscura de la sección (el verde de la tarjeta del cierre
 * del sitio, con el botón dorado encima, como en Contacto): el recorrido
 * termina en algo distinto de todo lo anterior. La montaña va sobre el eje del
 * sendero, como un mojón más grande, y es el centro de unos anillos de cota
 * (`summitRings.ts`): así se dibuja una cima en la carta del fondo.
 *
 * La frase grande es un `<p>` y no un título: debajo del `<h2>` de la sección
 * los `<h3>` son las preguntas, y esto no es una más.
 */
export function FaqSummit({ content }: FaqSummitProps) {
  const { title, lead, cta } = content;

  return (
    <div className={styles.summit} {...reveal('up')}>
      <svg
        className={styles.rings}
        viewBox={RINGS_VIEW_BOX}
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {SUMMIT_RINGS.map((ring) => (
          <path key={ring} d={ring} />
        ))}
      </svg>
      <span className={styles.badge} aria-hidden="true">
        <MountainSnow size={MOUNTAIN_SIZE} strokeWidth={ICON_STROKE_WIDTH} />
      </span>
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.lead}>{lead}</p>
      </div>
      <LinkButton
        href={cta.href}
        external={cta.external}
        size="lg"
        icon={<WhatsAppIcon />}
        className={styles.action}
      >
        {cta.label}
      </LinkButton>
    </div>
  );
}
