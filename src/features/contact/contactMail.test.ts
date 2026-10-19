import { describe, expect, it } from 'vitest';

import { CONTACT_EMAIL } from '@/constants/site';
import { contactContent, type ContactMailContent } from '@/content/sections/contact';

import {
  CONTACT_FIELD_NAMES,
  buildContactMailto,
  contactFormFallbackAction,
  mailtoHref,
  missingContactFields,
  readContactForm,
  type ContactFormValues,
} from './contactMail';

/** Plantilla fija para los tests de formato: no depende de los copys del contenido. */
const MAIL: ContactMailContent = {
  subject: 'Consulta desde la web',
  subjectSeparator: ' — ',
  bodyLabels: { name: 'Nombre', trip: 'Viaje', message: 'Mensaje' },
};

const EMAIL = 'hola@ejemplo.com';

/** Separa un `mailto:` en dirección, asunto y cuerpo ya decodificados. */
function parseMailto(href: string) {
  const url = new URL(href);
  return {
    protocol: url.protocol,
    address: url.pathname,
    subject: url.searchParams.get('subject'),
    body: url.searchParams.get('body'),
    rawQuery: url.search,
  };
}

function formData(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(entries)) data.append(name, value);
  return data;
}

describe('readContactForm', () => {
  it('lee cada campo por su name del HTML y le saca los espacios de los bordes', () => {
    const values = readContactForm(
      formData({ nombre: '  Juan ', viaje: 'Laguna Negra', mensaje: '\n Hola \n' }),
    );
    expect(values).toEqual({ name: 'Juan', trip: 'Laguna Negra', message: 'Hola' });
  });

  it('un campo que no vino cuenta como vacío', () => {
    expect(readContactForm(formData({ nombre: 'Juan' }))).toEqual({
      name: 'Juan',
      trip: '',
      message: '',
    });
  });

  it('los names son palabras en español: sin JS son los rótulos del cuerpo del mail', () => {
    expect(CONTACT_FIELD_NAMES).toEqual({ name: 'nombre', trip: 'viaje', message: 'mensaje' });
  });
});

describe('missingContactFields', () => {
  it('devuelve los vacíos en el orden del formulario (el primero es el que se enfoca)', () => {
    expect(missingContactFields({ name: '', trip: 'Lago Lolog', message: '' })).toEqual([
      'name',
      'message',
    ]);
  });

  it('con todo completo no falta nada', () => {
    expect(missingContactFields({ name: 'Ana', trip: 'Todavía no sé', message: 'Hola' })).toEqual(
      [],
    );
  });

  it('un campo con solo espacios cuenta como vacío (readContactForm ya lo recortó)', () => {
    const values = readContactForm(formData({ nombre: '   ', viaje: 'Lago Lolog', mensaje: ' ' }));
    expect(missingContactFields(values)).toEqual(['name', 'message']);
  });
});

describe('buildContactMailto', () => {
  const values: ContactFormValues = {
    name: 'Juana Pérez',
    trip: 'Calle & Stepanek',
    message: 'Hola!\nSomos 3 y queremos ir en enero.\n¿Hay lugar?',
  };

  it('va a la dirección de contacto', () => {
    const { protocol, address } = parseMailto(buildContactMailto(EMAIL, MAIL, values));
    expect(protocol).toBe('mailto:');
    expect(address).toBe(EMAIL);
  });

  it('arma el asunto con el viaje elegido', () => {
    const { subject } = parseMailto(buildContactMailto(EMAIL, MAIL, values));
    expect(subject).toBe('Consulta desde la web — Calle & Stepanek');
  });

  it('arma el cuerpo con nombre, viaje y mensaje, con saltos de línea CRLF', () => {
    const { body } = parseMailto(buildContactMailto(EMAIL, MAIL, values));
    expect(body).toBe(
      [
        'Nombre: Juana Pérez',
        'Viaje: Calle & Stepanek',
        '',
        'Mensaje:',
        'Hola!',
        'Somos 3 y queremos ir en enero.',
        '¿Hay lugar?',
      ].join('\r\n'),
    );
  });

  it('codifica con encodeURIComponent: los saltos como %0D%0A y nada crudo que rompa el query', () => {
    const href = buildContactMailto(EMAIL, MAIL, {
      name: 'Ana + Leo',
      trip: 'Calle & Stepanek',
      message: '¿50% de seña? #consulta\r\nlínea 2\rlínea 3',
    });
    const { rawQuery } = parseMailto(href);
    expect(rawQuery).toContain('%0D%0A');
    // Ningún \r ni \n suelto: todos los saltos quedaron como el par CRLF.
    expect(rawQuery.split('%0D%0A').join('')).not.toMatch(/%0D|%0A/);
    // Lo único crudo del query son el `?` inicial, el `&` entre parámetros y los `=`.
    expect(rawQuery.replace(/^\?subject=/, '').replace('&body=', '')).toMatch(
      /^[A-Za-z0-9\-_.!~*'()%]+$/,
    );
    expect(parseMailto(href).body).toContain('¿50% de seña? #consulta\r\nlínea 2\r\nlínea 3');
    expect(parseMailto(href).body).toContain('Nombre: Ana + Leo');
  });

  it('los espacios van como %20 y no como +: más de un cliente de correo deja el + literal', () => {
    const { rawQuery } = parseMailto(buildContactMailto(EMAIL, MAIL, values));
    expect(rawQuery).toContain('%20');
    expect(rawQuery).not.toContain('+');
  });
});

describe('mailtoHref y contactFormFallbackAction', () => {
  it('mailtoHref es la dirección sola', () => {
    expect(mailtoHref(EMAIL)).toBe('mailto:hola@ejemplo.com');
  });

  it('el action sin JS lleva solo el asunto base (el navegador le suma el cuerpo)', () => {
    const { address, subject, body } = parseMailto(contactFormFallbackAction(EMAIL, MAIL));
    expect(address).toBe(EMAIL);
    expect(subject).toBe('Consulta desde la web');
    expect(body).toBeNull();
  });
});

describe('contenido del formulario', () => {
  it('escribe a CONTACT_EMAIL', () => {
    expect(contactContent.email).toBe(CONTACT_EMAIL);
  });

  it('ofrece los viajes del catálogo en su orden y al final "Todavía no sé"', () => {
    expect(contactContent.form.tripOptions).toEqual([
      'Calle & Stepanek',
      'Lago Lolog',
      'Laguna Negra',
      'Cajón del Azul',
      'Todavía no sé',
    ]);
  });

  it('el asunto real sale como pidió el cliente: "Consulta desde la web — <viaje>"', () => {
    const href = buildContactMailto(CONTACT_EMAIL, contactContent.form.mail, {
      name: 'Juan',
      trip: 'Lago Lolog',
      message: 'Hola',
    });
    expect(parseMailto(href).subject).toBe('Consulta desde la web — Lago Lolog');
  });

  it('es texto plano: cruza la frontera al Client Component sin perder nada', () => {
    const { form } = contactContent;
    expect(JSON.parse(JSON.stringify(form))).toStrictEqual(form);
  });
});
