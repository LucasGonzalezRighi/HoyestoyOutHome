import { tripCatalog } from '@/content/catalog/trips';
import { PHOTOS } from '@/content/media';
import { ItineraryDay, Metric, ServiceChecklist } from '@/domain';

import {
  MEALS_FOOTNOTE,
  OVERVIEW_COPY,
  tripChecklist,
  tripClosing,
  tripCover,
  tripDepartures,
  tripMeals,
  tripMeta,
  tripSchedule,
} from './common';
import type { TripDetailContent } from './types';

/**
 * El viaje del catálogo. El destino, el título y las stats de distancia y
 * duración salen de acá: si el viaje cambia en el catálogo, la card del
 * carrusel y esta página cambian juntas.
 */
const trip = tripCatalog.get('lago-lolog-laguna-verde');

/**
 * Página de Lago Lolog a Laguna Verde. Copys verbatim del diseño: sección 07
 * (`dc.html:224-269`, datos `lologDesc`, `lologStats` e `itinerario` del
 * script, `dc.html:682-696`) y la checklist `data.lolog` (`dc.html:637-643`).
 */
export const lagoLologLagunaVerdeDetail: TripDetailContent = {
  meta: tripMeta(
    trip,
    'El tramo conecta Lago Lolog con Laguna Verde, atravesando algunos de los paisajes más imponentes de la región. Une lagos, bosques y volcanes en un itinerario exigente pero profundamente gratificante.',
  ),
  cover: tripCover(trip, {
    eyebrow: trip.destination,
    title: { rest: trip.name },
    subtitle: 'Bosques, volcanes y lagos…',
  }),
  overview: {
    title: OVERVIEW_COPY.title,
    paragraphs: [
      'Este recorrido, ubicado en la provincia de Neuquén, forma parte de la Huella Andina, un sendero de largo recorrido que une parajes del norte patagónico a través de la montaña.',
      'El tramo conecta Lago Lolog con Laguna Verde, atravesando algunos de los paisajes más imponentes de la región. Une lagos, bosques y volcanes en un itinerario exigente pero profundamente gratificante.',
      'La travesía recorre bosques puros de raulíes, ñires y lengas, cruza escoriales de lava del volcán Achen Ñiyeu y valles con vistas únicas del Lanín y el Villarrica.',
      'Caminaremos por senderos poco transitados, durmiendo en carpa y viviendo la experiencia de autosuficiencia en la montaña.',
      'Es un recorrido ideal para quienes buscan una experiencia auténtica, lejos de los circuitos turísticos clásicos, con la posibilidad de conocer la geografía, la ecología y la fuerza volcánica que da forma a este rincón único de la Patagonia.',
    ],
    modality:
      'Modalidad: travesía con mochila completa y pernocte en campamento. Dificultad media (etapas largas, con desnivel y terreno variado).',
    stats: {
      label: OVERVIEW_COPY.statsLabel,
      // `lologStats` (`dc.html:689`). No usa `tripMetrics`: en vez de la
      // cumbre lleva el desnivel acumulado. Los sufijos van en plural fijo
      // porque los números son mayores que 1.
      items: [
        new Metric({ value: trip.distanceKm, suffix: ' km', label: 'Distancia total' }),
        // Coincide con la suma de los desniveles del itinerario (570 + 310 + 530 + 490).
        new Metric({
          value: 1900,
          prefix: '+',
          suffix: ' m',
          label: 'Desnivel positivo acumulado',
        }),
        new Metric({ value: trip.duration.days, suffix: ' días', label: 'De travesía' }),
        new Metric({ value: trip.duration.nights, suffix: ' noches', label: 'En campamento' }),
      ],
    },
  },
  // `itinerario` (`dc.html:690-696`). Los encuadres que no son el base de la
  // foto salen del `pos` de cada etapa. Las fotos llevan el alt descriptivo de
  // `PHOTOS` y no el tramo como en el diseño: el tramo ya es el título del día
  // y el lector de pantalla lo leería dos veces.
  schedule: tripSchedule(trip, [
    new ItineraryDay({
      day: 0,
      title: 'Encuentro y revisión de equipo',
      photo: PHOTOS.lakeshoreRest,
      paragraphs: [
        'Encuentro en el centro de San Martín de los Andes. Presentación de los guías con el grupo y charla técnica: repaso del itinerario, expectativas y condiciones del terreno.',
        'Revisión de equipo personal (calzado, abrigo, mochila) y distribución de equipo grupal (carpas, cocina, etc.).',
      ],
    }),
    new ItineraryDay({
      day: 1,
      title: 'Puerto Arturo – Auquinco',
      photo: PHOTOS.refugeUnderStars.withPosition('center 75%'),
      distanceKm: 12,
      elevationGainM: 570,
      paragraphs: [
        'A las 9:00 partimos desde San Martín de los Andes en un transfer rumbo a Puerto Arturo, donde iniciamos la travesía.',
        'Atravesamos un pintoresco bosque de raulíes, ñires y lengas hasta llegar a Auquinco, donde armamos nuestro primer campamento.',
      ],
    }),
    new ItineraryDay({
      day: 2,
      title: 'Auquinco – Rincón de los Pinos',
      photo: PHOTOS.valleyDescent,
      distanceKm: 11.3,
      elevationGainM: 310,
      paragraphs: [
        'Desde el Portezuelo de Auquinco, el sendero desciende entre lomadas y pequeños cañadones, con vistas abiertas del valle por donde corre el arroyo Auquinco.',
        'Sobre el final avanzamos entre bosques de lengas y claros de pastizales hasta Rincón de los Pinos, ideal para el segundo campamento.',
      ],
    }),
    new ItineraryDay({
      day: 3,
      title: 'Rincón de los Pinos – Cazadores',
      photo: PHOTOS.lakeshoreHorse,
      distanceKm: 10,
      elevationGainM: 530,
      paragraphs: [
        'Retomamos el sendero junto al arroyo Auquinco. El terreno asciende suavemente y deja ver el escorial del volcán Achen Ñiyeu, con vistas del Lanín y el Villarrica.',
        'Llegamos al Refugio Cazadores, una construcción sencilla entre lengas, ideal para descansar antes de seguir rumbo a Laguna Verde.',
      ],
    }),
    new ItineraryDay({
      day: 4,
      title: 'Cazadores – Achen Ñiyeu – Laguna Verde',
      photo: PHOTOS.volcanoView.withPosition('center 30%'),
      distanceKm: 8.8,
      elevationGainM: 490,
      paragraphs: [
        'Último día: bordeamos el escorial del Achen Ñiyeu, un inmenso mar de piedra negra que contrasta con el verde del bosque, con los volcanes Lanín y Villarrica de fondo.',
        'Descendemos a Laguna Verde, donde nos espera el vehículo para regresar a San Martín de los Andes.',
      ],
    }),
  ]),
  checklist: tripChecklist(
    new ServiceChecklist({
      included: [
        'Guías habilitados',
        'Carpas de montaña',
        'Pensión completa (no incluye día 0 y cena del día 4)',
        'Equipo y botiquín principal de primeros auxilios',
        'Equipos de comunicación para emergencias: VHF',
        'Reuniones previas informativas',
        'Seguro de accidentes personales',
        'Asistencia y coordinación permanente',
      ],
      transfers: [
        'San Martín de los Andes hasta Puerto Arturo',
        'Laguna Verde hasta San Martín de los Andes',
      ],
      notIncluded: ['Viaje hasta San Martín de los Andes', 'Gastos por abandono del programa'],
      clothing: [
        'Camiseta térmica sintética',
        'Remera sintética manga corta',
        'Medias sintéticas',
        'Guantes (tipo mágicos)',
        'Buff',
        'Ropa interior',
        'Buzo micropolar',
        'Pantalón de trekking',
        'Campera tipo Uniqlo',
        'Parka impermeable',
        'Gorro de lana',
        'Gorra de sol',
        'Botas de trekking',
        'Calzado tipo Crocs para campamento',
        'Zapatillas para mojar',
      ],
      gear: [
        'Bolsa de dormir (límite −8 / −10 °C)',
        'Aislante',
        'Mochila de 60 litros en adelante',
        'Cubremochila',
        'Bastones de trekking',
        'Lentes de sol',
        'Papel higiénico / toallas húmedas',
        'Kit de higiene personal',
        'Toalla chica (secado rápido)',
        'Protectores: solar y labial',
        'Repelente de insectos',
        'Linterna frontal',
        'Botella de 1 L',
      ],
    }),
  ),
  // La nota del diseño decía "En Lago Lolog no incluye…" porque era una sola
  // pensión para los dos viajes; en su propia página ya no hace falta nombrarlo.
  meals: tripMeals(`${MEALS_FOOTNOTE} No incluye día 0 ni la cena del día 4.`),
  departures: tripDepartures(trip),
  closing: tripClosing(trip),
};
