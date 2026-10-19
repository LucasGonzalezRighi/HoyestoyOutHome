import type { ContactFieldKey, ContactMailContent } from '@/content/sections/contact';

/**
 * Lógica pura del formulario de Contacto: leer lo que se escribió, ver qué
 * falta y armar el `mailto:`. Sin React ni DOM (salvo `FormData`, que también
 * existe en Node), así se testea sola (`contactMail.test.ts`).
 *
 * Vive en el feature y no en `domain/` porque hoy solo la usa este
 * formulario; si otro canal necesitara armar mails, es candidata a una clase
 * del dominio al lado de `WhatsAppLink`.
 */

/**
 * `name` de cada campo en el HTML. Sin JS el formulario se envía tal cual y el
 * cuerpo del mail queda `nombre=…`, `viaje=…`, `mensaje=…`: por eso son
 * palabras en español y no las claves en inglés del código.
 */
export const CONTACT_FIELD_NAMES = {
  name: 'nombre',
  trip: 'viaje',
  message: 'mensaje',
} as const satisfies Record<ContactFieldKey, string>;

/** Los campos en el orden del formulario: el primero que falte es el que se enfoca. */
const FIELD_ORDER: readonly ContactFieldKey[] = ['name', 'trip', 'message'];

/** Salto de línea de un mail. RFC 6068 pide `%0D%0A` en el `body` de un `mailto:`. */
const CRLF = '\r\n';

/** Cualquier salto de línea: el `<textarea>` entrega `\n`, y lo pegado de Windows puede traer `\r\n`. */
const LINE_BREAK = /\r\n|\r|\n/g;

/** Lo que se escribió en el formulario, ya sin espacios en los bordes. */
export type ContactFormValues = Readonly<Record<ContactFieldKey, string>>;

/** Lee los tres campos de un `FormData`. Lo que no esté (o sea un archivo) cuenta como vacío. */
export function readContactForm(data: FormData): ContactFormValues {
  const read = (key: ContactFieldKey): string => {
    const value = data.get(CONTACT_FIELD_NAMES[key]);
    return typeof value === 'string' ? value.trim() : '';
  };
  return { name: read('name'), trip: read('trip'), message: read('message') };
}

/**
 * Los campos vacíos, en el orden del formulario. Es la misma regla que
 * `required` (`validity.valueMissing`) con una diferencia: un campo con solo
 * espacios también cuenta como vacío, porque `readContactForm` ya los recortó.
 */
export function missingContactFields(values: ContactFormValues): readonly ContactFieldKey[] {
  return FIELD_ORDER.filter((key) => values[key] === '');
}

/** El link para escribir a una dirección, sin asunto ni cuerpo: `mailto:hola@ejemplo.com`. */
export function mailtoHref(email: string): string {
  return `mailto:${email}`;
}

/**
 * Codifica un texto para el query de un `mailto:`. Primero lleva todos los
 * saltos de línea a CRLF (que `encodeURIComponent` vuelve `%0D%0A`, como pide
 * RFC 6068) y después codifica todo lo demás: `&`, `?`, `#`, `%`, `+`, los
 * acentos y la raya del asunto romperían el link si fueran crudos.
 */
function encodeMailtoText(text: string): string {
  return encodeURIComponent(text.replace(LINE_BREAK, CRLF));
}

/**
 * El `mailto:` completo que abre el cliente de correo con todo escrito.
 *
 * - Asunto: "Consulta desde la web — Calle & Stepanek".
 * - Cuerpo: un renglón por dato ("Nombre: Juan", "Viaje: Calle & Stepanek"),
 *   un renglón en blanco y el mensaje, con sus saltos de línea.
 */
export function buildContactMailto(
  email: string,
  mail: ContactMailContent,
  values: ContactFormValues,
): string {
  const { subject, subjectSeparator, bodyLabels } = mail;
  const fullSubject = `${subject}${subjectSeparator}${values.trip}`;
  const body = [
    `${bodyLabels.name}: ${values.name}`,
    `${bodyLabels.trip}: ${values.trip}`,
    '',
    `${bodyLabels.message}:`,
    values.message,
  ].join(CRLF);
  return `${mailtoHref(email)}?subject=${encodeMailtoText(fullSubject)}&body=${encodeMailtoText(body)}`;
}

/**
 * El `action` del formulario para cuando no hay JS: un `mailto:` con el asunto
 * base. Con `method="post"` y `enctype="text/plain"`, el navegador le agrega
 * el cuerpo (`&body=nombre%3DJuan%0D%0A…`) y abre el cliente de correo. Con
 * JS no se usa: el envío lo intercepta el formulario y arma el link completo.
 */
export function contactFormFallbackAction(email: string, mail: ContactMailContent): string {
  return `${mailtoHref(email)}?subject=${encodeMailtoText(mail.subject)}`;
}
