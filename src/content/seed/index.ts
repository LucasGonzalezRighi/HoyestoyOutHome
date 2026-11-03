import { SITE } from '@/constants/site';
import { SITE_RECORD_SCHEMA_VERSION, type SiteRecord } from '@/content/records/schema';

import { SEED_TRIPS } from './trips';

/**
 * El contenido editable tal como estaba en el código antes del panel de
 * administración (octubre 2026). Sirve para dos cosas:
 *
 * 1. Es lo primero que se guarda en la base (la primera vez que se lee y está
 *    vacía, `server/content/` la llena con esto).
 * 2. Es el respaldo del sitio: si la base no responde o lo guardado no pasa la
 *    validación, el sitio se muestra con esto y nunca queda vacío.
 *
 * Una vez que hay contenido en la base, editar este archivo no cambia el
 * sitio: el contenido se edita desde `/admin`.
 */
export const SEED_RECORD: SiteRecord = {
  schemaVersion: SITE_RECORD_SCHEMA_VERSION,
  trips: [...SEED_TRIPS],
  // [completar] Fechas de ejemplo: el cliente las reemplaza desde el panel.
  departures: [
    { id: 'seed-1', tripSlug: 'calle-stepanek', startsOn: '2026-11-13' },
    { id: 'seed-2', tripSlug: 'lago-lolog-laguna-verde', startsOn: '2026-12-05' },
    { id: 'seed-3', tripSlug: 'laguna-negra', startsOn: '2027-01-09' },
    { id: 'seed-4', tripSlug: 'cajon-del-azul', startsOn: '2027-02-06' },
    { id: 'seed-5', tripSlug: 'calle-stepanek', startsOn: '2027-03-12' },
  ],
  // Las respuestas que empiezan con "[confirmar]" dependen de condiciones que
  // el cliente todavía no pasó (equipo, reserva y seña, medios de pago, clima,
  // cancelación, edad mínima, condición médica).
  faq: [
    {
      id: 'seed-experiencia',
      question: '¿Necesito experiencia previa en montaña?',
      answer:
        'No hace falta experiencia en altura, aunque es recomendable que hayas hecho algún trekking antes. En la página de cada viaje está el “¿Puedo?”, con lo que pide esa travesía en particular.',
    },
    {
      id: 'seed-preparacion',
      question: '¿Qué preparación física necesito?',
      answer:
        'Vas a tener caminatas largas, desniveles pronunciados (sin pasos técnicos) y clima cambiante, así que lo ideal es que entrenes con regularidad. Antes de salir hacemos reuniones informativas para que llegues con todo claro.',
    },
    {
      id: 'seed-guias',
      question: '¿Las salidas son guiadas? ¿Cuántos somos por grupo?',
      answer:
        'Sí, todas van con guías habilitados de Turismo Aventura y de Montaña. Armamos grupos reducidos, para darte atención personalizada antes y durante cada salida.',
    },
    {
      id: 'seed-incluye',
      question: '¿Qué incluye el viaje?',
      answer:
        'Guías, refugio o carpas según el viaje, pensión completa durante la travesía, traslados desde el punto de encuentro, seguro de accidentes personales, botiquín, comunicación VHF y reuniones previas. El detalle está en la página de cada viaje; llegar hasta el punto de encuentro corre por tu cuenta.',
    },
    {
      id: 'seed-equipo',
      question: '¿Tengo que llevar mi propio equipo?',
      answer:
        '[confirmar] Sí, el equipo personal lo llevás vos: en la página de cada viaje está la lista de qué llevar. Si te falta algo, escribinos y vemos cómo resolverlo.',
    },
    {
      id: 'seed-reserva',
      question: '¿Cómo reservo mi lugar?',
      answer:
        '[confirmar] Escribinos por WhatsApp o desde el formulario de contacto. Reservás con una seña y la diferencia la abonás el día del encuentro.',
    },
    {
      id: 'seed-pagos',
      question: '¿Qué medios de pago aceptan?',
      answer: '[confirmar] Escribinos y te pasamos los medios de pago disponibles para cada viaje.',
    },
    {
      id: 'seed-clima',
      question: '¿Qué pasa si el clima no acompaña?',
      answer:
        '[confirmar] En la montaña la seguridad va primero: si el clima no acompaña, los guías pueden ajustar el itinerario sobre la marcha.',
    },
    {
      id: 'seed-cancelacion',
      question: '¿Cuál es la política de cancelación?',
      answer:
        '[confirmar] Escribinos antes de reservar y te contamos las condiciones. Tené en cuenta que los gastos por abandono del programa no están incluidos en el viaje.',
    },
    {
      id: 'seed-solo',
      question: '¿Puedo ir solo o sola?',
      answer:
        'Sí. Los grupos son reducidos y compartís cada jornada con el resto, así que te integrás enseguida.',
    },
    {
      id: 'seed-edad',
      question: '¿Hay edad mínima?',
      answer:
        '[confirmar] Contanos quién viaja y te decimos qué travesía le conviene según la edad y la experiencia.',
    },
    {
      id: 'seed-salud',
      question: '¿Qué pasa si tengo alguna condición médica?',
      answer:
        '[confirmar] Contanos antes de reservar: así los guías lo tienen en cuenta y te decimos si el viaje es para vos.',
    },
  ],
  // Verbatim del diseño (array `T` del script, `dc.html:646-654`).
  testimonials: [
    {
      id: 'seed-sofia',
      quote:
        'Nunca había hecho un trekking de más de un día. Me acompañaron en cada paso y llegué a lugares que no me creía capaz.',
      author: 'Sofía M.',
      city: 'Buenos Aires',
      tripName: 'Calle & Stepanek',
      rating: 5,
    },
    {
      id: 'seed-martin',
      quote:
        'Todo resuelto: comida, refugio, tiempos. Vos solo caminás y mirás. El grupo terminó siendo lo mejor del viaje.',
      author: 'Martín R.',
      city: 'Córdoba',
      tripName: 'Calle & Stepanek',
      rating: 5,
    },
    {
      id: 'seed-carolina',
      quote:
        'Se nota que conocen la montaña y que la cuidan. Me volví con la cabeza limpia y ganas de repetir.',
      author: 'Carolina G.',
      city: 'Rosario',
      tripName: 'Lago Lolog',
      rating: 5,
    },
    {
      id: 'seed-julian',
      quote:
        'Mi primer 4mil. Cuando llegamos a la cumbre del Adolfo Calle no lo podía creer. Los guías te hacen sentir seguro todo el tiempo.',
      author: 'Julián P.',
      city: 'Mendoza',
      tripName: 'Calle & Stepanek',
      rating: 5,
    },
    {
      id: 'seed-valentina',
      quote:
        'Dormir en carpa entre lengas y despertar con el Lanín enfrente es algo que no me voy a olvidar nunca.',
      author: 'Valentina S.',
      city: 'La Plata',
      tripName: 'Lago Lolog',
      rating: 5,
    },
    {
      id: 'seed-luciana',
      quote:
        'Fui sola y volví con amigos. Grupo chico, buena onda y una organización impecable de principio a fin.',
      author: 'Luciana F.',
      city: 'Buenos Aires',
      tripName: 'Lago Lolog',
      rating: 5,
    },
    {
      id: 'seed-tomas',
      quote:
        'Las reuniones previas me sirvieron un montón para preparar el equipo. Llegué tranquilo y lo disfruté cada día.',
      author: 'Tomás B.',
      city: 'Neuquén',
      tripName: 'Calle & Stepanek',
      rating: 5,
    },
  ],
  home: {
    hero: {
      headline: ['Creo experiencias en la montaña', 'para reconectar con lo esencial.'],
      lead: [
        'Trekkings y ascensos guiados por Mendoza y la Patagonia.',
        'Grupos reducidos, atención personalizada y la montaña de verdad.',
      ],
      ribbon: [
        'Tu primer 4mil',
        'Huella Andina',
        'Mendoza',
        'Neuquén',
        'Grupos reducidos',
        SITE.name,
      ],
    },
    whyUs: {
      title: 'La montaña de verdad, sin que tengas que resolver nada',
      pillars: [
        {
          title: 'Guías habilitados',
          description:
            'Guías de Turismo Aventura y de Montaña, con años de experiencia en el terreno.',
        },
        {
          title: 'Grupos pequeños',
          description: 'Salidas chicas para ir a tu ritmo, conocernos y disfrutar el camino.',
        },
        {
          title: 'Logística resuelta',
          description: 'Traslados, refugio o carpas, pensión completa y reuniones previas.',
        },
        {
          title: 'Seguridad siempre',
          description:
            'Botiquín, comunicación VHF, seguro de accidentes y coordinación permanente.',
        },
      ],
    },
    trips: {
      title: 'Elegí tu próxima aventura',
      lead: 'Pasá por cada travesía y entrá a la que te llame. No necesitás experiencia en altura, solo ganas.',
    },
    calendar: {
      title: 'Próximas salidas',
      lead: 'Elegí la fecha que mejor te quede y reservá tu lugar.',
      note: 'Fechas de ejemplo: las salidas reales se cargan desde el panel de administración.',
    },
    testimonials: { title: 'Lo que se traen de la montaña' },
    faq: {
      title: 'Lo que nos preguntan antes de salir',
      lead: 'Experiencia, equipo, reservas y clima: lo que hay que saber antes de anotarte.',
      summitTitle: '¿Tu duda no está en el camino?',
      summitLead: 'Escribinos por WhatsApp o desde el formulario de contacto y te respondemos.',
    },
    contact: {
      title: '¿Te animás a subir?',
      lead: 'Contanos qué viaje te interesa y te pasamos fechas, disponibilidad y todo lo que necesitás saber.',
    },
  },
};
