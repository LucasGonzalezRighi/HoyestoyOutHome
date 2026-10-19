import { WhatsAppIcon } from '@/components/atoms/WhatsAppIcon';
import { EXTERNAL_LINK_PROPS } from '@/constants/links';
import { magnet } from '@/motion/attributes';

import styles from './FloatingWhatsApp.module.css';

/**
 * Lado del logo dentro del círculo de 60px: 32px, un poco más de la mitad. El
 * logo de WhatsApp es un relleno que ocupa toda su caja, así que a 32px pesa lo
 * que tiene que pesar en el círculo sin tocar el borde (quedan 14px de aire).
 */
const ICON_SIZE = 32;

/** Props de `FloatingWhatsApp`: destino y nombres accesibles. */
export type FloatingWhatsAppProps = {
  /** Link a WhatsApp, ya armado (`WhatsAppLink` del dominio). */
  href: string;
  /** Nombre accesible del botón: es solo un icono. */
  ariaLabel: string;
  /**
   * Nombre del landmark `complementary` que envuelve al botón. El botón va al
   * final del DOM, fuera del nav, del main y del footer: sin un landmark
   * propio, quien navega por regiones no lo encuentra (regla `region` de axe).
   */
  regionLabel: string;
};

/**
 * Botón flotante de WhatsApp, abajo a la derecha (`dc.html:385-389`). Es el
 * funnel de la landing, así que está siempre a mano. Magnético: se deja
 * atraer por el cursor cercano (`MagnetEffect`).
 *
 * Lleva el logo de WhatsApp y no el globo de chat del diseño (lo pidió el
 * cliente: el globo no se leía como WhatsApp), sobre el verde musgo de la marca.
 *
 * El `<aside>` no lleva estilos: el `position: fixed` y el imán (`magnet()`)
 * siguen en el `<a>`, así que ni la posición ni el orden de tabulación cambian.
 */
export function FloatingWhatsApp({ href, ariaLabel, regionLabel }: FloatingWhatsAppProps) {
  return (
    <aside aria-label={regionLabel}>
      <a
        className={styles.button}
        href={href}
        {...EXTERNAL_LINK_PROPS}
        aria-label={ariaLabel}
        {...magnet()}
      >
        <WhatsAppIcon size={ICON_SIZE} className={styles.icon} />
      </a>
    </aside>
  );
}
