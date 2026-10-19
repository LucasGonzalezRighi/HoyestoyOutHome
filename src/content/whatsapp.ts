import { WHATSAPP } from '@/constants/site';
import { WhatsAppLink } from '@/domain';

/**
 * El link de WhatsApp de la marca: la única instancia de `WhatsAppLink`.
 *
 * Todos los CTA de contacto (nav, hero, cierre, botón flotante, footer) salen
 * de acá: `whatsapp.href()` con el mensaje por defecto, y
 * `whatsapp.href(mensaje)` con el del viaje en los "Consultar" de cada página
 * de viaje (`content/trips/common.ts`).
 */
export const whatsapp = new WhatsAppLink(WHATSAPP.phone, WHATSAPP.defaultMessage);
