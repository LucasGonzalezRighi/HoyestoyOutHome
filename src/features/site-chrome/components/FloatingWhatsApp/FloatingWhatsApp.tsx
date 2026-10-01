import { ChatIcon } from '@/components/atoms/ChatIcon';
import { magnet } from '@/motion/attributes';

import styles from './FloatingWhatsApp.module.css';

/** Tamaño del icono dentro del círculo de 60px (`dc.html:387`). */
const ICON_SIZE = 27;

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
 * El `<aside>` no lleva estilos: el `position: fixed` y el imán (`magnet()`)
 * siguen en el `<a>`, así que ni la posición ni el orden de tabulación cambian.
 */
export function FloatingWhatsApp({ href, ariaLabel, regionLabel }: FloatingWhatsAppProps) {
  return (
    <aside aria-label={regionLabel}>
      <a
        className={styles.button}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        {...magnet()}
      >
        <ChatIcon size={ICON_SIZE} />
      </a>
    </aside>
  );
}
