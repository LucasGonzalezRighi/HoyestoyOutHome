import { ChatIcon } from '@/components/atoms/ChatIcon';
import { magnet } from '@/motion/attributes';

import styles from './FloatingWhatsApp.module.css';

/** Tamaño del icono dentro del círculo de 60px (`dc.html:387`). */
const ICON_SIZE = 27;

/** Props de `FloatingWhatsApp`: destino y nombre accesible. */
export type FloatingWhatsAppProps = {
  /** Link a WhatsApp, ya armado (`WhatsAppLink` del dominio). */
  href: string;
  /** Nombre accesible del botón: es solo un icono. */
  ariaLabel: string;
};

/**
 * Botón flotante de WhatsApp, abajo a la derecha (`dc.html:385-389`). Es el
 * funnel de la landing, así que está siempre a mano. Magnético: se deja
 * atraer por el cursor cercano (`MagnetEffect`).
 */
export function FloatingWhatsApp({ href, ariaLabel }: FloatingWhatsAppProps) {
  return (
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
  );
}
