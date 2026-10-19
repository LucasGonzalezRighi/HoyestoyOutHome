import { CONTACT_EMAIL, SITE, SOCIAL_PROFILES } from '@/constants/site';
import { tripCatalog } from '@/content/catalog/trips';
import type { CallToAction } from '@/content/types';
import { whatsapp } from '@/content/whatsapp';

/* ────────────────────────────────────────────────────────────────────────── */
/*  Contacto (cierre del home)                                                */
/* ────────────────────────────────────────────────────────────────────────── */

/** Los tres campos del formulario breve, en el orden en que se muestran. */
export type ContactFieldKey = 'name' | 'trip' | 'message';

/** Textos de un campo del formulario. */
export type ContactFieldContent = {
  /** El `<label>` visible. */
  readonly label: string;
  /** Ejemplo dentro del campo; en el select, el texto de la opción vacía ("Elegí un viaje"). */
  readonly placeholder: string;
  /** Mensaje cuando se envía con el campo vacío. Lo lee el lector de pantalla al enfocar el campo. */
  readonly error: string;
};

/**
 * Cómo se arma el mail que abre el formulario. Son piezas sueltas y no una
 * función porque el formulario es un Client Component: lo que recibe por
 * props tiene que poder serializarse.
 *
 * El asunto queda `subject + subjectSeparator + viaje` ("Consulta desde la web
 * — Calle & Stepanek"). Sin JS el formulario se envía igual, pero el asunto es
 * solo `subject`: el viaje se elige en la página y el HTML no puede sumarlo.
 */
export type ContactMailContent = {
  /** "Consulta desde la web". */
  readonly subject: string;
  /** Lo que separa el asunto del viaje elegido: " — ". */
  readonly subjectSeparator: string;
  /** Rótulo de cada dato en el cuerpo del mail ("Nombre: Juan"). */
  readonly bodyLabels: Readonly<Record<ContactFieldKey, string>>;
};

/**
 * El mensaje de estado después de enviar. El mail va en el medio, como link:
 * `before` + `<a href="mailto:…">mail</a>` + `after`.
 */
export type ContactSentStatusContent = {
  /** "Se abrió tu app de correo. Si no se abrió, escribinos a". */
  readonly before: string;
  /** Lo que sigue al mail (el punto final). */
  readonly after: string;
};

/**
 * Textos del formulario breve. Todo es texto plano (ninguna instancia del
 * dominio): lo renderiza un Client Component.
 */
export type ContactFormContent = {
  /** Título del formulario (`h3`); también es su nombre accesible. */
  readonly title: string;
  /** Instrucción arriba de los campos: son obligatorios y el envío abre la app de correo. */
  readonly hint: string;
  /** Textos de cada campo. */
  readonly fields: Readonly<Record<ContactFieldKey, ContactFieldContent>>;
  /**
   * Opciones del select de viaje: los viajes del catálogo, en su orden, y al
   * final "Todavía no sé". Cada texto es también el valor que se envía, así
   * el mail dice el nombre del viaje y no su slug. Es el nombre corto
   * (`shortName`): el largo de Calle & Stepanek trae su propia raya
   * ("— Tu primer 4mil") y el asunto quedaría con dos.
   */
  readonly tripOptions: readonly string[];
  /** Texto del botón de envío. */
  readonly submitLabel: string;
  /** Mensaje de estado después de enviar. */
  readonly sentStatus: ContactSentStatusContent;
  /** Asunto y cuerpo del mail. */
  readonly mail: ContactMailContent;
};

/** La alternativa al formulario: WhatsApp y el mail a la vista, debajo del título. */
export type ContactChannelsContent = {
  /** "Escribinos por WhatsApp": abre el chat con el mensaje por defecto. */
  readonly cta: CallToAction;
  /** Lo que precede al mail, que va como link: "También podés escribirnos a". */
  readonly emailIntro: string;
};

/**
 * Textos de Contacto, el cierre del home: la frase gigante que se parte al
 * scrollear y, debajo, el título con la alternativa (WhatsApp y el mail) a la
 * izquierda y el formulario breve (arma un `mailto:`) a la derecha.
 */
export type ContactContent = {
  /**
   * La frase gigante, en sus dos mitades: cada una viaja a un costado al
   * scrollear ("La montaña" / "te espera.").
   */
  readonly giant: { readonly start: string; readonly end: string };
  /** El título de la sección (`h2`), debajo de la frase: "¿Te animás a subir?". */
  readonly title: string;
  /** Bajada del título. */
  readonly lead: string;
  /** Dirección a la que va el formulario y que se muestra como link (`CONTACT_EMAIL`). */
  readonly email: string;
  /** El formulario breve. */
  readonly form: ContactFormContent;
  /** La alternativa: WhatsApp y el mail. */
  readonly channels: ContactChannelsContent;
};

/** Última opción del select de viaje, para quien todavía no eligió. */
const UNDECIDED_TRIP = 'Todavía no sé';

/** Contenido de Contacto. El título es el del cierre del diseño (`dc.html:369`). */
export const contactContent: ContactContent = {
  giant: { start: 'La montaña', end: 'te espera.' },
  title: '¿Te animás a subir?',
  lead: 'Contanos qué viaje te interesa y te pasamos fechas, disponibilidad y todo lo que necesitás saber.',
  email: CONTACT_EMAIL,
  form: {
    title: 'Mandanos tu consulta',
    hint: 'Completá los tres campos. Al enviar se abre tu app de correo con el mensaje listo para mandar.',
    fields: {
      name: {
        label: 'Nombre',
        placeholder: 'Cómo te llamás',
        error: 'Escribí tu nombre.',
      },
      trip: {
        label: 'Viaje que te interesa',
        placeholder: 'Elegí un viaje',
        error: `Elegí un viaje (o “${UNDECIDED_TRIP}”).`,
      },
      message: {
        label: 'Mensaje',
        placeholder: 'Fechas, cuántos son, dudas sobre el viaje…',
        error: 'Escribí tu consulta.',
      },
    },
    tripOptions: [...tripCatalog.all().map((trip) => trip.shortName), UNDECIDED_TRIP],
    submitLabel: 'Enviar consulta',
    sentStatus: {
      before: 'Se abrió tu app de correo. Si no se abrió, escribinos a',
      after: '.',
    },
    mail: {
      subject: 'Consulta desde la web',
      subjectSeparator: ' — ',
      bodyLabels: { name: 'Nombre', trip: 'Viaje', message: 'Mensaje' },
    },
  },
  channels: {
    cta: {
      label: 'Escribinos por WhatsApp',
      href: whatsapp.href(),
      external: true,
    },
    emailIntro: 'También podés escribirnos a',
  },
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Footer                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Textos del footer del sitio (`dc.html:374-382`): marca, redes + WhatsApp y
 * la nota de cierre. En el diseño vive adentro de la sección 13; acá es el
 * `<footer>` de la página (fuera del `<main>`), por eso tiene slice propio.
 */
export type FooterContent = {
  /** Nombre de la marca, en la tipografía de títulos. */
  readonly brand: string;
  /** Nombre accesible de la lista de links (el diseño no lo trae: es una lista sin título visible). */
  readonly linksLabel: string;
  /** Instagram, TikTok y WhatsApp. Todos salen del sitio (`external: true`). */
  readonly links: readonly CallToAction[];
  /** "Turismo Aventura · Argentina · 2026". */
  readonly note: string;
};

/**
 * Contenido del footer. Los destinos salen de `SOCIAL_PROFILES` y de la
 * instancia `whatsapp`: ningún link se escribe a mano.
 */
export const footerContent: FooterContent = {
  brand: SITE.name,
  linksLabel: 'Redes y contacto',
  links: [
    { label: 'Instagram', href: SOCIAL_PROFILES.instagram.url, external: true },
    { label: 'TikTok', href: SOCIAL_PROFILES.tiktok.url, external: true },
    { label: 'WhatsApp', href: whatsapp.href(), external: true },
  ],
  note: 'Turismo Aventura · Argentina · 2026',
};
