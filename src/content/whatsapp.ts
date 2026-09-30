import { WHATSAPP } from '@/constants/site';
import { WhatsAppLink } from '@/domain';

/**
 * El link de WhatsApp de la marca: la única instancia de `WhatsAppLink`.
 *
 * Todos los CTA de contacto (nav, hero, cierre, botón flotante, footer) salen
 * de acá: `whatsapp.href()` con el mensaje por defecto, `whatsapp.chatHref()`
 * para los "Consultar" de los viajes sin página propia.
 */
export const whatsapp = new WhatsAppLink(WHATSAPP.phone, WHATSAPP.defaultMessage);
