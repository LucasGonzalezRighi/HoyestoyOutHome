import type { CallToAction, SectionHeadingContent } from '@/content/types';
import { whatsapp } from '@/content/whatsapp';

/**
 * Una pregunta frecuente y su respuesta.
 *
 * Es un tipo plano (CLAUDE.md §4.5): solo dato. La respuesta es texto corrido,
 * sin links ni formato, porque la renderiza un Client Component (el acordeón)
 * y tiene que poder cruzar la frontera servidor → cliente tal cual.
 */
export type FaqEntry = {
  /** La pregunta, en la voz de quien consulta ("¿Puedo ir solo o sola?"). */
  readonly question: string;
  /** La respuesta: de una a tres oraciones. */
  readonly answer: string;
};

/**
 * El cierre de la sección, la "cumbre" donde termina el sendero de preguntas:
 * invita a escribir si la duda no estaba en la lista.
 */
export type FaqSummitContent = {
  /** La frase grande del cierre. */
  readonly title: string;
  /** Por dónde escribir y qué pasa después. */
  readonly lead: string;
  /** El botón a WhatsApp. */
  readonly cta: CallToAction;
};

/**
 * Textos de "Preguntas frecuentes" (sección nueva del home, pedida por el
 * cliente en octubre de 2026: no está en el diseño).
 */
export type FaqContent = Required<SectionHeadingContent> & {
  /** Bajada: de qué hablan las preguntas, en un renglón o dos. */
  readonly lead: string;
  /** Las preguntas, en el orden en que se muestran. */
  readonly entries: readonly FaqEntry[];
  /** El cierre, después de la última pregunta. */
  readonly summit: FaqSummitContent;
};

/**
 * Contenido de "Preguntas frecuentes".
 *
 * Las respuestas usan solo lo que el sitio ya dice (el "¿Puedo?" y el "Qué
 * incluye" de cada viaje, los pilares de "Por qué viajar", la seña de Calle &
 * Stepanek). **Las que empiezan con `[confirmar]` dependen de condiciones que
 * el cliente todavía no pasó**: el comentario de arriba de cada una dice qué
 * falta. Cuando las confirme, se reescribe la respuesta y se saca el prefijo.
 */
export const faqContent: FaqContent = {
  eyebrow: 'Preguntas frecuentes',
  title: 'Lo que nos preguntan antes de salir',
  lead: 'Experiencia, equipo, reservas y clima: lo que conviene tener claro antes de anotarte.',
  entries: [
    {
      question: '¿Necesito experiencia previa en montaña?',
      answer:
        'No hace falta experiencia en altura, aunque es recomendable que hayas hecho algún trekking antes. En la página de cada viaje está el “¿Puedo?”, con lo que pide esa travesía en particular.',
    },
    {
      question: '¿Qué preparación física necesito?',
      answer:
        'Vas a tener caminatas largas, desniveles pronunciados (sin pasos técnicos) y clima cambiante, así que lo ideal es que entrenes con regularidad. Antes de salir hacemos reuniones informativas para que llegues con todo claro.',
    },
    {
      question: '¿Las salidas son guiadas? ¿Cuántos somos por grupo?',
      answer:
        'Sí, todas van con guías habilitados de Turismo Aventura y de Montaña. Armamos grupos chicos, para darte atención personalizada antes y durante cada salida.',
    },
    {
      question: '¿Qué incluye el viaje?',
      answer:
        'Guías, refugio o carpas según el viaje, pensión completa durante la travesía, traslados desde el punto de encuentro, seguro de accidentes personales, botiquín, comunicación VHF y reuniones previas. El detalle está en la página de cada viaje; llegar hasta el punto de encuentro corre por tu cuenta.',
    },
    // [confirmar] si alquilan o prestan equipo.
    {
      question: '¿Tengo que llevar mi propio equipo?',
      answer:
        '[confirmar] Sí, el equipo personal lo llevás vos: en la página de cada viaje está la lista de qué llevar. Si te falta algo, escribinos y vemos cómo resolverlo.',
    },
    // [confirmar] si la seña y el pago del saldo el día del encuentro valen para todos los viajes (así figura en Calle & Stepanek).
    {
      question: '¿Cómo reservo mi lugar?',
      answer:
        '[confirmar] Escribinos por WhatsApp o desde el formulario de contacto. Reservás con una seña y la diferencia la abonás el día del encuentro.',
    },
    // [confirmar] los medios de pago.
    {
      question: '¿Qué medios de pago aceptan?',
      answer: '[confirmar] Escribinos y te pasamos los medios de pago disponibles para cada viaje.',
    },
    // [confirmar] qué pasa si una salida no se puede hacer (reprogramación, devolución).
    {
      question: '¿Qué pasa si el clima no acompaña?',
      answer:
        '[confirmar] En la montaña la seguridad va primero: si el clima no acompaña, los guías pueden ajustar el itinerario sobre la marcha.',
    },
    // [confirmar] la política de cancelación. Lo único que el sitio ya dice es que los gastos por abandono no están incluidos.
    {
      question: '¿Cuál es la política de cancelación?',
      answer:
        '[confirmar] Escribinos antes de reservar y te contamos las condiciones. Tené en cuenta que los gastos por abandono del programa no están incluidos en el viaje.',
    },
    {
      question: '¿Puedo ir solo o sola?',
      answer:
        'Sí. Los grupos son chicos y compartís cada jornada con el resto, así que te integrás enseguida.',
    },
    // [confirmar] si hay edad mínima y si los menores viajan con un adulto.
    {
      question: '¿Hay edad mínima?',
      answer:
        '[confirmar] Contanos quién viaja y te decimos qué travesía le conviene según la edad y la experiencia.',
    },
    // [confirmar] si piden apto médico.
    {
      question: '¿Qué pasa si tengo alguna condición médica?',
      answer:
        '[confirmar] Contanos antes de reservar: así los guías lo tienen en cuenta y te decimos si el viaje es para vos.',
    },
  ],
  summit: {
    title: '¿Tu duda no está en el camino?',
    lead: 'Escribinos por WhatsApp o desde el formulario de contacto y te respondemos.',
    cta: { label: 'Escribinos por WhatsApp', href: whatsapp.href(), external: true },
  },
};
