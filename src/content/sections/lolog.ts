import { tripCatalog } from '@/content/catalog/trips';
import { PHOTOS } from '@/content/media';
import type { SectionHeadingContent } from '@/content/types';
import { ItineraryStage, Metric } from '@/domain';

/**
 * El viaje del catálogo que presenta esta sección. El eyebrow, el título y
 * las stats de distancia y duración salen de acá: si el viaje cambia en el
 * catálogo, la card de "Próximos viajes" y esta sección cambian juntas.
 */
const lologTrip = tripCatalog.get('lolog');

/** Textos del itinerario apilado (`dc.html:246-268`). */
export type LologItineraryContent = {
  /** Título del bloque ("Itinerario"). */
  readonly title: string;
  /**
   * Prefijos de los tags de cada etapa: `"Distancia:"` y `"Desnivel:"`. El
   * valor (`"12 km"`, `"+570 m"`) lo formatea la etapa.
   */
  readonly metricLabels: {
    readonly distance: string;
    readonly elevation: string;
  };
  /** Las etapas, en orden (día 0 a día 4): cada una es una card apilable. */
  readonly stages: readonly ItineraryStage[];
};

/**
 * Contenido de la sección 07 "Lago Lolog a Laguna Verde"
 * (`docs/design/hoy-estoy-ooh-landing.dc.html:224-269`, datos `lologDesc`,
 * `lologStats` e `itinerario` del script, `dc.html:682-696`).
 */
export type LologContent = SectionHeadingContent & {
  /** Destino del viaje en mayúsculas arriba del título. En esta sección no es opcional. */
  readonly eyebrow: string;
  /** Bajada en itálica debajo del título ("Bosques, volcanes y lagos…"). */
  readonly subtitle: string;
  /** Los párrafos de la columna izquierda (`lologDesc`). */
  readonly description: readonly string[];
  /** Las cuatro stats verdes con contador (`lologStats`). */
  readonly stats: readonly Metric[];
  /** Nota de modalidad y dificultad, debajo de las stats. */
  readonly modality: string;
  /** El bloque "Itinerario": título, prefijos de los tags y las cinco etapas apilables. */
  readonly itinerary: LologItineraryContent;
};

/** Textos, stats e itinerario de Lago Lolog. */
export const lologContent: LologContent = {
  eyebrow: lologTrip.destination,
  title: lologTrip.name,
  subtitle: 'Bosques, volcanes y lagos…',
  description: [
    'Este recorrido, ubicado en la provincia de Neuquén, forma parte de la Huella Andina, un sendero de largo recorrido que une parajes del norte patagónico a través de la montaña.',
    'El tramo conecta Lago Lolog con Laguna Verde, atravesando algunos de los paisajes más imponentes de la región. Une lagos, bosques y volcanes en un itinerario exigente pero profundamente gratificante.',
    'La travesía recorre bosques puros de raulíes, ñires y lengas, cruza escoriales de lava del volcán Achen Ñiyeu y valles con vistas únicas del Lanín y el Villarrica.',
    'Caminaremos por senderos poco transitados, durmiendo en carpa y viviendo la experiencia de autosuficiencia en la montaña.',
    'Es un recorrido ideal para quienes buscan una experiencia auténtica, lejos de los circuitos turísticos clásicos, con la posibilidad de conocer la geografía, la ecología y la fuerza volcánica que da forma a este rincón único de la Patagonia.',
  ],
  // `lologStats` (`dc.html:689`). Los sufijos van en plural fijo porque el
  // número es mayor que 1; si la duración del viaje bajara a 1, cambiarlos.
  stats: [
    new Metric({ value: lologTrip.distanceKm, suffix: ' km', label: 'Distancia total' }),
    // Coincide con la suma de los desniveles del itinerario (570 + 310 + 530 + 490).
    new Metric({ value: 1900, prefix: '+', suffix: ' m', label: 'Desnivel positivo acumulado' }),
    new Metric({ value: lologTrip.duration.days, suffix: ' días', label: 'De travesía' }),
    new Metric({ value: lologTrip.duration.nights, suffix: ' noches', label: 'En campamento' }),
  ],
  modality:
    'Modalidad: travesía con mochila completa y pernocte en campamento. Dificultad media (etapas largas, con desnivel y terreno variado).',
  itinerary: {
    title: 'Itinerario',
    metricLabels: { distance: 'Distancia:', elevation: 'Desnivel:' },
    // `itinerario` (`dc.html:690-696`). Los encuadres que no son el base de la
    // foto salen del `pos` de cada etapa. Las fotos llevan el alt descriptivo
    // de `PHOTOS` y no el tramo como en el diseño (`alt="{{ it.tramo }}"`,
    // `dc.html:264`): el tramo ya es el título de la card y el lector de
    // pantalla lo leería dos veces.
    stages: [
      new ItineraryStage({
        day: 0,
        route: 'Encuentro y revisión de equipo',
        photo: PHOTOS.lakeshoreRest,
        paragraphs: [
          'Encuentro en el centro de San Martín de los Andes. Presentación de los guías con el grupo y charla técnica: repaso del itinerario, expectativas y condiciones del terreno.',
          'Revisión de equipo personal (calzado, abrigo, mochila) y distribución de equipo grupal (carpas, cocina, etc.).',
        ],
      }),
      new ItineraryStage({
        day: 1,
        route: 'Puerto Arturo – Auquinco',
        photo: PHOTOS.refugeUnderStars.withPosition('center 75%'),
        distanceKm: 12,
        elevationGainM: 570,
        paragraphs: [
          'A las 9:00 partimos desde San Martín de los Andes en un transfer rumbo a Puerto Arturo, donde iniciamos la travesía.',
          'Atravesamos un pintoresco bosque de raulíes, ñires y lengas hasta llegar a Auquinco, donde armamos nuestro primer campamento.',
        ],
      }),
      new ItineraryStage({
        day: 2,
        route: 'Auquinco – Rincón de los Pinos',
        photo: PHOTOS.valleyDescent,
        distanceKm: 11.3,
        elevationGainM: 310,
        paragraphs: [
          'Desde el Portezuelo de Auquinco, el sendero desciende entre lomadas y pequeños cañadones, con vistas abiertas del valle por donde corre el arroyo Auquinco.',
          'Sobre el final avanzamos entre bosques de lengas y claros de pastizales hasta Rincón de los Pinos, ideal para el segundo campamento.',
        ],
      }),
      new ItineraryStage({
        day: 3,
        route: 'Rincón de los Pinos – Cazadores',
        photo: PHOTOS.lakeshoreHorse,
        distanceKm: 10,
        elevationGainM: 530,
        paragraphs: [
          'Retomamos el sendero junto al arroyo Auquinco. El terreno asciende suavemente y deja ver el escorial del volcán Achen Ñiyeu, con vistas del Lanín y el Villarrica.',
          'Llegamos al Refugio Cazadores, una construcción sencilla entre lengas, ideal para descansar antes de seguir rumbo a Laguna Verde.',
        ],
      }),
      new ItineraryStage({
        day: 4,
        route: 'Cazadores – Achen Ñiyeu – Laguna Verde',
        photo: PHOTOS.volcanoView.withPosition('center 30%'),
        distanceKm: 8.8,
        elevationGainM: 490,
        paragraphs: [
          'Último día: bordeamos el escorial del Achen Ñiyeu, un inmenso mar de piedra negra que contrasta con el verde del bosque, con los volcanes Lanín y Villarrica de fondo.',
          'Descendemos a Laguna Verde, donde nos espera el vehículo para regresar a San Martín de los Andes.',
        ],
      }),
    ],
  },
};
