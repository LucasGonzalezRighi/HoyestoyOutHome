import { SITE } from '@/constants/site';
import { tripCatalog } from '@/content/catalog/trips';
import { ItineraryDay, ServiceChecklist } from '@/domain';

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
import { tripMetrics } from './tripMetrics';
import type { TripDetailContent } from './types';

/**
 * El viaje del catálogo. Duración, dificultad, cumbre y distancia salen de acá
 * y no se reescriben: si cambian en el catálogo, cambian también en la card
 * del carrusel y en el calendario.
 */
const trip = tripCatalog.get('calle-stepanek');

/**
 * Primera letra en mayúscula, con las reglas del locale del sitio. El dato
 * "Dificultad" de "¿Puedo?" dice "Media": sale de `trip.difficulty`.
 */
function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase(SITE.locale) + text.slice(1);
}

/**
 * Página de Calle & Stepanek. Copys verbatim del diseño: secciones 04 y 05
 * (`dc.html:142-211`, arrays `cronograma`, `puedo`, `ideal` y `trabajamos` de
 * `renderVals()`, `dc.html:673-681`) y la checklist `data.calle`
 * (`dc.html:630-636`). El cierre no lleva el monto ni la nota de reserva del
 * diseño (`dc.html:366-368`): el cliente pidió que el sitio no muestre valores.
 */
export const calleStepanekDetail: TripDetailContent = {
  meta: tripMeta(
    trip,
    'Iniciate en la alta montaña: cuatro días para salir de la rutina, conocer el ambiente de montaña y vivir el desafío de alcanzar tus primeras cumbres de más de 4.000 metros.',
  ),
  cover: tripCover(trip, {
    eyebrow: 'Mendoza',
    title: { accent: 'Calle &', rest: 'Stepanek' },
    subtitle: 'Tu primer 4mil',
  }),
  overview: {
    title: OVERVIEW_COPY.title,
    paragraphs: [
      'Iniciate en la alta montaña: cuatro días para salir de la rutina, conocer el ambiente de montaña y vivir el desafío de alcanzar tus primeras cumbres de más de 4.000 metros.',
      'Queremos que puedas acercarte progresivamente a la montaña y disfrutar del desafío acompañado por un guía.',
    ],
    highlight: 'Una experiencia física, intensa y profundamente desconectada de la rutina.',
    stats: {
      label: OVERVIEW_COPY.statsLabel,
      // Las noches son en el refugio de Vallecitos (día 1 del cronograma y "Refugio de montaña" en lo que incluye).
      items: tripMetrics(trip, {
        distance: 'Distancia total',
        days: 'De travesía',
        nights: 'En refugio',
        summit: 'Cumbre más alta',
      }),
    },
  },
  schedule: tripSchedule(trip, [
    new ItineraryDay({
      day: 1,
      title: 'Mendoza – Refugio',
      paragraphs: [
        '10:00 encuentro en la ciudad de Mendoza. Transfer al refugio en Vallecitos. Primera jornada de trekking y retorno al refugio.',
      ],
      distanceKm: 4,
      elevationGainM: 280,
      walkingHours: 2,
    }),
    new ItineraryDay({
      day: 2,
      title: 'Cumbres de La Cadenita',
      paragraphs: ['Segunda jornada de trekking. Cumbres de 3.000 m. Retorno al refugio.'],
      distanceKm: 7,
      elevationGainM: 820,
      walkingHours: 4,
    }),
    new ItineraryDay({
      day: 3,
      title: 'Cumbres Adolfo Calle y Stepanek',
      paragraphs: ['Tercera jornada de trekking. Cumbres de más de 4.000 m. Retorno al refugio.'],
      distanceKm: 13,
      elevationGainM: 1400,
      walkingHours: 5,
    }),
    // Día de regreso: sin caminata, sin stats (`stats: null` en el diseño).
    new ItineraryDay({
      day: 4,
      title: 'Retorno a Mendoza',
      paragraphs: ['Desayuno y transfer a Mendoza.'],
    }),
  ]),
  fit: {
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
        items: [
          'Grupos pequeños.',
          'Atención personalizada, tanto antes como durante la travesía.',
        ],
      },
    },
  },
  checklist: tripChecklist(
    new ServiceChecklist({
      included: [
        'Guías',
        'Refugio de montaña',
        'Pensión completa durante la travesía',
        'Equipo y botiquín principal de primeros auxilios',
        'Equipos de comunicación para emergencias: VHF',
        'Reuniones previas informativas',
        'Seguro de accidentes personales',
        'Asistencia y coordinación permanente',
      ],
      transfers: ['Mendoza a Vallecitos', 'Vallecitos a Mendoza'],
      notIncluded: ['Viaje hasta Mendoza Capital', 'Gastos por abandono del programa'],
      clothing: [
        'Camiseta sintética',
        'Remera sintética manga corta',
        'Medias sintéticas (2 pares)',
        'Guantes',
        'Buff (cuello sintético)',
        'Ropa interior',
        'Buzo micropolar',
        'Pantalón de trekking',
        'Campera de abrigo (tipo Uniqlo)',
        'Parka impermeable',
        'Gorro de lana',
        'Gorra de sol',
        'Botas de trekking',
      ],
      gear: [
        'Mochila mediana',
        'Bastones de trekking',
        'Lentes de sol',
        'Papel higiénico / toallas húmedas',
        'Kit de higiene personal',
        'Medicamentos personales',
        'Protectores: solar y labial',
        'Linterna frontal',
        '2 L de agua',
      ],
    }),
  ),
  meals: tripMeals(MEALS_FOOTNOTE),
  departures: tripDepartures(trip),
  closing: tripClosing(trip),
};
