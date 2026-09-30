import { describe, expect, it } from 'vitest';

import { WhatsAppLink } from './WhatsAppLink';

const MESSAGE = 'Hola! Quiero info sobre los viajes de Hoy Estoy Out Of Home';
const whatsapp = new WhatsAppLink('541153347012', MESSAGE);

describe('WhatsAppLink', () => {
  it('arma el link con el mensaje por defecto codificado', () => {
    expect(whatsapp.href()).toBe(
      'https://wa.me/541153347012?text=Hola!%20Quiero%20info%20sobre%20los%20viajes%20de%20Hoy%20Estoy%20Out%20Of%20Home',
    );
  });

  it('codifica con encodeURIComponent los signos y acentos de otro mensaje', () => {
    const message = '¿Hay lugar en Calle & Stepanek? #marzo';
    expect(whatsapp.href(message)).toBe(
      `https://wa.me/541153347012?text=${encodeURIComponent(message)}`,
    );
    expect(whatsapp.href(message)).toContain('%26');
    expect(whatsapp.href(message)).toContain('%23');
  });

  it('chatHref abre el chat sin mensaje', () => {
    expect(whatsapp.chatHref()).toBe('https://wa.me/541153347012');
  });

  it('withMessage cambia el mensaje por defecto sin tocar el original', () => {
    const other = whatsapp.withMessage('Hola');
    expect(other.href()).toBe('https://wa.me/541153347012?text=Hola');
    expect(other.phone).toBe('541153347012');
    expect(whatsapp.defaultMessage).toBe(MESSAGE);
  });

  it('tira con teléfonos que no son 8 a 15 dígitos', () => {
    expect(() => new WhatsAppLink('+541153347012', MESSAGE)).toThrow('de 8 a 15 dígitos');
    expect(() => new WhatsAppLink('11 5334 7012', MESSAGE)).toThrow();
    expect(() => new WhatsAppLink('1234567', MESSAGE)).toThrow();
    expect(() => new WhatsAppLink('1234567890123456', MESSAGE)).toThrow();
  });

  it('tira con mensajes en blanco', () => {
    expect(() => new WhatsAppLink('541153347012', ' ')).toThrow('El mensaje de WhatsApp');
    expect(() => whatsapp.href('')).toThrow('El mensaje de WhatsApp');
  });
});
