import { SITE } from '@/constants/site';
import { tripCatalog } from '@/content/catalog/trips';
import { PHOTOS } from '@/content/media';
import { formatMeters, ScheduleDay, type Photo } from '@/domain';

/**
 * El viaje que cuentan las dos secciones. Duración y dificultad salen de acá
 * y no se reescriben: si cambian en el catálogo, cambian también en la card
 * de "Próximos viajes", en los tags de la foto y en "¿Puedo?".
 */
const trip = tripCatalog.get('calle-stepanek');

/**
 * Altura del Cerro Adolfo Calle, la cumbre más alta del viaje: la del cartel
 * de la foto sticky ("4.290 m s.n.m."). El catálogo no la modela porque es un
 * dato de este viaje y no de todos.
 */
const SUMMIT_ELEVATION_M = 4290;

/**
 * Primera letra en mayúscula, con las reglas del locale del sitio. El dato
 * "Dificultad" de "¿Puedo?" dice "Media" y el tag de la foto "Dificultad
 * media": los dos salen de `trip.difficulty`.
 */
function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase(SITE.locale) + text.slice(1);
}

/**
 * Los tres tags debajo de la foto (`dc.html:147-151`). Son campos con nombre y
 * no una lista porque cada uno lleva su propio tinte, y el tinte es una
 * decisión visual: la toma el feature, no el contenido.
 */
export type CalleStepanekTagsContent = {
  /** "4 días, 3 noches". */
  readonly duration: string;
  /** "Cumbre 4.290 m". */
  readonly summit: string;
  /** "Dificultad media". */
  readonly difficulty: string;
};

/**
 * El título "Calle & Stepanek" en dos tramos: el primero va en dorado
 * (`<span style="color: var(--color-accent-500)">Calle &amp;</span> Stepanek`,
 * `dc.html:155`). El espacio entre los dos lo pone el componente.
 */
export type CalleStepanekTitleContent = {
  /** Tramo en dorado: "Calle &". */
  readonly accent: string;
  /** Resto del título: "Stepanek". */
  readonly rest: string;
};

/** Sección 04: foto sticky con sus tags y la presentación del viaje (`dc.html:142-159`). */
export type CalleStepanekOverviewContent = {
  /** Foto de la columna sticky (el cartel de cumbre del Adolfo Calle). */
  readonly photo: Photo;
  /** Los tres tags debajo de la foto. */
  readonly tags: CalleStepanekTagsContent;
  /** "Mendoza". */
  readonly eyebrow: string;
  /** El `<h2>` "Calle & Stepanek", con su tramo en dorado. */
  readonly title: CalleStepanekTitleContent;
  /** "Tu primer 4mil", en la fuente de títulos pero como bajada (no es un encabezado). */
  readonly subtitle: string;
  /** Los dos párrafos de presentación, en orden. */
  readonly paragraphs: readonly string[];
  /** El párrafo en negrita que cierra la presentación. */
  readonly highlight: string;
};

/** Cronograma día por día de la sección 04 (`dc.html:161-177`). */
export type CalleStepanekScheduleContent = {
  /** "Cronograma". */
  readonly title: string;
  /** "4 días, 3 noches". */
  readonly subtitle: string;
  /** Un `ScheduleDay` por día; el último (regreso) no tiene stats. */
  readonly days: readonly ScheduleDay[];
};

/** Un dato de "¿Puedo?": etiqueta en mayúsculas y valor ("Clima" → "Cambiante"). */
export type CalleStepanekFactContent = {
  /** La etiqueta, que el componente pasa a mayúsculas: "Clima". */
  readonly label: string;
  /** El valor: "Cambiante". */
  readonly value: string;
};

/** Card "¿Puedo?" de la sección 05 (`dc.html:182-196`). */
export type CalleStepanekRequirementsContent = {
  /** "¿Puedo?". */
  readonly title: string;
  /** La respuesta: "No hace falta experiencia en altura…". */
  readonly lead: string;
  /** Los cinco datos de la grilla (array `puedo` de `renderVals()`). */
  readonly facts: readonly CalleStepanekFactContent[];
};

/** Una lista con su rótulo: "Ideal si:" / "Trabajamos con:". */
export type CalleStepanekAudienceListContent = {
  /** El rótulo en negrita arriba de la lista; también le da nombre accesible a la lista. */
  readonly title: string;
  /** Los ítems, en orden; cada uno entra un escalón después del anterior. */
  readonly items: readonly string[];
};

/** Card "¿Es para mí?" de la sección 05 (`dc.html:197-209`). */
export type CalleStepanekAudienceContent = {
  /** "¿Es para mí?". */
  readonly title: string;
  /** La respuesta: "Si sentís que necesitás salir del ruido…". */
  readonly lead: string;
  /** "Ideal si:" (array `ideal` de `renderVals()`). */
  readonly ideal: CalleStepanekAudienceListContent;
  /** "Trabajamos con:" (array `trabajamos` de `renderVals()`). */
  readonly approach: CalleStepanekAudienceListContent;
};

/**
 * Textos de las secciones 04 "Calle & Stepanek" y 05 "¿Puedo? / ¿Es para mí?".
 *
 * Van en un solo slice porque son un solo tema: la 05 no tiene título propio,
 * sigue contando el mismo viaje (por eso su aire es el compacto).
 */
export type CalleStepanekContent = {
  /** 04: foto, tags y presentación del viaje. */
  readonly overview: CalleStepanekOverviewContent;
  /** 04: cronograma día por día. */
  readonly schedule: CalleStepanekScheduleContent;
  /** 05: card "¿Puedo?". */
  readonly requirements: CalleStepanekRequirementsContent;
  /** 05: card "¿Es para mí?". */
  readonly audience: CalleStepanekAudienceContent;
};

/**
 * Contenido de Calle & Stepanek. Copys verbatim del diseño: el marcado
 * (`dc.html:142-211`) y los arrays `cronograma`, `puedo`, `ideal` y
 * `trabajamos` de `renderVals()` (`dc.html:673-681`).
 */
export const calleStepanekContent: CalleStepanekContent = {
  overview: {
    // Sin encuadre propio: la foto sticky usa el centrado del registro (la
    // card de "Próximos viajes" es la que la baja a `center 62%`).
    photo: PHOTOS.calleSummitSign,
    tags: {
      duration: trip.duration.sentence(),
      summit: `Cumbre ${formatMeters(SUMMIT_ELEVATION_M)}`,
      difficulty: trip.difficultyLabel(),
    },
    eyebrow: 'Mendoza',
    title: { accent: 'Calle &', rest: 'Stepanek' },
    subtitle: 'Tu primer 4mil',
    paragraphs: [
      'Iniciate en la alta montaña: cuatro días para salir de la rutina, conocer el ambiente de montaña y vivir el desafío de alcanzar tus primeras cumbres de más de 4.000 metros.',
      'Queremos que puedas acercarte progresivamente a la montaña y disfrutar del desafío acompañado por un guía.',
    ],
    highlight: 'Una experiencia física, intensa y profundamente desconectada de la rutina.',
  },
  schedule: {
    title: 'Cronograma',
    subtitle: trip.duration.sentence(),
    days: [
      new ScheduleDay({
        day: 1,
        title: 'Mendoza – Refugio',
        description:
          '10:00 encuentro en la ciudad de Mendoza. Transfer al refugio en Vallecitos. Primera jornada de trekking y retorno al refugio.',
        distanceKm: 4,
        elevationGainM: 280,
        walkingHours: 2,
      }),
      new ScheduleDay({
        day: 2,
        title: 'Cumbres de La Cadenita',
        description: 'Segunda jornada de trekking. Cumbres de 3.000 m. Retorno al refugio.',
        distanceKm: 7,
        elevationGainM: 820,
        walkingHours: 4,
      }),
      new ScheduleDay({
        day: 3,
        title: 'Cumbres Adolfo Calle y Stepanek',
        description: 'Tercera jornada de trekking. Cumbres de más de 4.000 m. Retorno al refugio.',
        distanceKm: 13,
        elevationGainM: 1400,
        walkingHours: 5,
      }),
      // Día de regreso: sin caminata, sin stats (`stats: null` en el diseño).
      new ScheduleDay({
        day: 4,
        title: 'Retorno a Mendoza',
        description: 'Desayuno y transfer a Mendoza.',
      }),
    ],
  },
  requirements: {
    title: '¿Puedo?',
    lead: 'No hace falta experiencia en altura, aunque es recomendable haber realizado trekkings con anterioridad.',
    facts: [
      { label: 'Caminatas', value: 'Largas' },
      { label: 'Clima', value: 'Cambiante' },
      { label: 'Terreno', value: 'Variable' },
      { label: 'Dificultad', value: capitalize(trip.difficulty) },
      { label: 'Desniveles', value: 'Pronunciados, sin pasos técnicos' },
    ],
  },
  audience: {
    title: '¿Es para mí?',
    lead: 'Si sentís que necesitás salir del ruido, moverte y vivir una experiencia distinta, este ascenso probablemente sea para vos.',
    ideal: {
      title: 'Ideal si:',
      items: [
        'Entrenás regularmente.',
        'Disfrutás caminar.',
        'Te sentís cómodo en la naturaleza.',
        'Buscás un desafío físico real.',
      ],
    },
    approach: {
      title: 'Trabajamos con:',
      items: ['Grupos pequeños.', 'Atención personalizada, tanto antes como durante la travesía.'],
    },
  },
};
