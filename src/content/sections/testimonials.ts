import { tripCatalog } from '@/content/catalog/trips';
import type { SectionHeadingContent } from '@/content/types';
import { Testimonial } from '@/domain';

/**
 * Contenido de la sección 11, los testimonios (`dc.html:330-343`; datos en el
 * array `T` del script, `dc.html:646-654`).
 *
 * El diseño arma la cinta con `testimoniosLoop: T.concat(T)` (`dc.html:715`).
 * Acá la lista va **una sola vez**: la copia la pone el organism `Marquee`,
 * que además la oculta a los lectores de pantalla.
 */
export type TestimonialsContent = SectionHeadingContent & {
  /** Nombre de la región para lectores de pantalla (el `aria-label` de la sección). */
  readonly ariaLabel: string;
  /** Separador entre autor, ciudad y viaje en el pie de cada testimonio. */
  readonly captionSeparator: string;
  /** Los testimonios, en el orden del diseño. */
  readonly testimonials: readonly Testimonial[];
  /** Texto del botón que pausa la cinta (no está en el diseño: WCAG 2.2.2, CLAUDE.md §9). */
  readonly marqueePauseLabel: string;
  /** Texto del mismo botón con la cinta en pausa. */
  readonly marqueeResumeLabel: string;
};

/** Los testimonios nombran el viaje por su nombre corto: sale del catálogo para que no se desfase. */
const CALLE_STEPANEK = tripCatalog.get('calle-stepanek').shortName;
const LOLOG = tripCatalog.get('lolog').shortName;

/** Textos y testimonios de "Lo que se traen de la montaña", verbatim del diseño. */
export const testimonialsContent: TestimonialsContent = {
  ariaLabel: 'Testimonios',
  title: 'Lo que se traen de la montaña',
  captionSeparator: ' · ',
  marqueePauseLabel: 'Pausar testimonios',
  marqueeResumeLabel: 'Reanudar testimonios',
  testimonials: [
    new Testimonial({
      quote:
        'Nunca había hecho un trekking de más de un día. Me acompañaron en cada paso y llegué a lugares que no me creía capaz.',
      author: 'Sofía M.',
      city: 'Buenos Aires',
      tripName: CALLE_STEPANEK,
    }),
    new Testimonial({
      quote:
        'Todo resuelto: comida, refugio, tiempos. Vos solo caminás y mirás. El grupo terminó siendo lo mejor del viaje.',
      author: 'Martín R.',
      city: 'Córdoba',
      tripName: CALLE_STEPANEK,
    }),
    new Testimonial({
      quote:
        'Se nota que conocen la montaña y que la cuidan. Me volví con la cabeza limpia y ganas de repetir.',
      author: 'Carolina G.',
      city: 'Rosario',
      tripName: LOLOG,
    }),
    new Testimonial({
      quote:
        'Mi primer 4mil. Cuando llegamos a la cumbre del Adolfo Calle no lo podía creer. Los guías te hacen sentir seguro todo el tiempo.',
      author: 'Julián P.',
      city: 'Mendoza',
      tripName: CALLE_STEPANEK,
    }),
    new Testimonial({
      quote:
        'Dormir en carpa entre lengas y despertar con el Lanín enfrente es algo que no me voy a olvidar nunca.',
      author: 'Valentina S.',
      city: 'La Plata',
      tripName: LOLOG,
    }),
    new Testimonial({
      quote:
        'Fui sola y volví con amigos. Grupo chico, buena onda y una organización impecable de principio a fin.',
      author: 'Luciana F.',
      city: 'Buenos Aires',
      tripName: LOLOG,
    }),
    new Testimonial({
      quote:
        'Las reuniones previas me sirvieron un montón para preparar el equipo. Llegué tranquilo y lo disfruté cada día.',
      author: 'Tomás B.',
      city: 'Neuquén',
      tripName: CALLE_STEPANEK,
    }),
  ],
};
