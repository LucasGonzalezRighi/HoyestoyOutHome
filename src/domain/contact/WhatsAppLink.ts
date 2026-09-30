import { assertText } from '../shared/invariants';

/** Base de los links de click-to-chat. */
const WA_ME = 'https://wa.me';

/**
 * Formato que acepta `wa.me`: número internacional solo con dígitos (sin `+`,
 * espacios ni guiones). 15 es el máximo de E.164; menos de 8 no es un número
 * internacional completo.
 */
const PHONE_PATTERN = /^\d{8,15}$/;

/**
 * El link de WhatsApp, que es el único canal de contacto de la landing (no hay
 * formulario ni backend).
 *
 * Encapsula las dos formas que usa el diseño:
 * - `href()` abre el chat con un mensaje ya escrito (nav, hero, cierre, botón flotante).
 * - `chatHref()` abre el chat vacío (los "Consultar" de los viajes sin página propia).
 */
export class WhatsAppLink {
  private readonly props: Readonly<{ phone: string; defaultMessage: string }>;

  /**
   * @param phone Número internacional solo con dígitos (`541153347012`).
   * @param defaultMessage Mensaje precargado cuando no se pide otro.
   */
  constructor(phone: string, defaultMessage: string) {
    if (!PHONE_PATTERN.test(phone)) {
      throw new Error(
        `El teléfono de WhatsApp tiene que ser un número internacional de 8 a 15 dígitos, sin "+" ni espacios (llegó ${JSON.stringify(phone)}).`,
      );
    }
    assertText(defaultMessage, 'El mensaje de WhatsApp');
    this.props = Object.freeze({ phone, defaultMessage });
  }

  get phone(): string {
    return this.props.phone;
  }

  get defaultMessage(): string {
    return this.props.defaultMessage;
  }

  /**
   * Link al chat con el mensaje precargado. El mensaje va por
   * `encodeURIComponent`: los signos (`!`, `&`, `¿`) y los acentos romperían el
   * query string si fueran crudos.
   */
  href(message: string = this.props.defaultMessage): string {
    assertText(message, 'El mensaje de WhatsApp');
    return `${this.chatHref()}?text=${encodeURIComponent(message)}`;
  }

  /** Link al chat sin mensaje precargado. */
  chatHref(): string {
    return `${WA_ME}/${this.props.phone}`;
  }

  /** El mismo número con otro mensaje por defecto (p. ej. uno por viaje). */
  withMessage(message: string): WhatsAppLink {
    return new WhatsAppLink(this.props.phone, message);
  }
}
