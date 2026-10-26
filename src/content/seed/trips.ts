import { PHOTOS } from '@/content/media';
import { toPhotoRecord } from '@/content/records/photos';
import type { TripRecord } from '@/content/records/schema';
import { difficultyLabel, formatKilometers, TripDuration } from '@/domain';

/**
 * Los cuatro viajes tal como estaban en el código antes del panel de
 * administración (octubre 2026), en el orden del abanico del home. Es el
 * contenido inicial de la base y el respaldo del sitio si la base no responde
 * (`server/content/siteContent.ts`).
 *
 * Copys verbatim del diseño (Calle & Stepanek: secciones 04 y 05 y la
 * checklist `data.calle`, `dc.html:142-211` y `630-636`; Lago Lolog: sección
 * 07 y la checklist `data.lolog`, `dc.html:224-269` y `637-643`). Laguna Negra
 * y Cajón del Azul todavía no tienen programa: solo los datos del catálogo y
 * "Itinerario próximamente".
 */
export const SEED_TRIPS: readonly TripRecord[] = [
  {
    slug: 'calle-stepanek',
    visible: true,
    name: 'Calle & Stepanek — Tu primer 4mil',
    shortName: 'Calle & Stepanek',
    destination: 'Mendoza · Vallecitos',
    days: 4,
    nights: 3,
    difficulty: 'media',
    distanceKm: 24,
    // El Cerro Adolfo Calle: la altura del cartel de la foto ("4.290 m s.n.m.").
    summitElevationM: 4290,
    priceArs: 690000,
    // La portada la encuadra más abajo que el registro (`pos: 'center 62%'` en el diseño).
    photo: toPhotoRecord(PHOTOS.calleSummitSign.withPosition('center 62%')),
    // En el panel del home, con `center 62%` el cartel de cumbre cae justo
    // detrás del título: desde arriba se ven el cielo y los picos nevados.
    panelPosition: 'center 0%',
    description:
      'Iniciate en la alta montaña: cuatro días para salir de la rutina, conocer el ambiente de montaña y vivir el desafío de alcanzar tus primeras cumbres de más de 4.000 metros.',
    cover: {
      eyebrow: 'Mendoza',
      titleAccent: 'Calle &',
      titleRest: 'Stepanek',
      subtitle: 'Tu primer 4mil',
    },
    overview: {
      paragraphs: [
        'Iniciate en la alta montaña: cuatro días para salir de la rutina, conocer el ambiente de montaña y vivir el desafío de alcanzar tus primeras cumbres de más de 4.000 metros.',
        'Queremos que puedas acercarte progresivamente a la montaña y disfrutar del desafío acompañado por un guía.',
      ],
      highlight: 'Una experiencia física, intensa y profundamente desconectada de la rutina.',
    },
    // Las noches son en el refugio de Vallecitos (día 1 del cronograma y "Refugio de montaña" en lo que incluye).
    stats: { mode: 'auto', nightsLabel: 'En refugio' },
    itinerary: [
      {
        day: 1,
        title: 'Mendoza – Refugio',
        paragraphs: [
          '10:00 encuentro en la ciudad de Mendoza. Transfer al refugio en Vallecitos. Primera jornada de trekking y retorno al refugio.',
        ],
        distanceKm: 4,
        elevationGainM: 280,
        walkingHours: 2,
      },
      {
        day: 2,
        title: 'Cumbres de La Cadenita',
        paragraphs: ['Segunda jornada de trekking. Cumbres de 3.000 m. Retorno al refugio.'],
        distanceKm: 7,
        elevationGainM: 820,
        walkingHours: 4,
      },
      {
        day: 3,
        title: 'Cumbres Adolfo Calle y Stepanek',
        paragraphs: ['Tercera jornada de trekking. Cumbres de más de 4.000 m. Retorno al refugio.'],
        distanceKm: 13,
        elevationGainM: 1400,
        walkingHours: 5,
      },
      // Día de regreso: sin caminata, sin stats (`stats: null` en el diseño).
      {
        day: 4,
        title: 'Retorno a Mendoza',
        paragraphs: ['Desayuno y transfer a Mendoza.'],
      },
    ],
    fit: {
      requirementsLead:
        'No hace falta experiencia en altura, aunque es recomendable haber realizado trekkings con anterioridad.',
      facts: [
        { label: 'Caminatas', value: 'Largas' },
        { label: 'Clima', value: 'Cambiante' },
        { label: 'Terreno', value: 'Variable' },
        { label: 'Dificultad', value: 'Media' },
        { label: 'Desniveles', value: 'Pronunciados, sin pasos técnicos' },
      ],
      audienceLead:
        'Si sentís que necesitás salir del ruido, moverte y vivir una experiencia distinta, este ascenso probablemente sea para vos.',
      ideal: [
        'Entrenás regularmente.',
        'Disfrutás caminar.',
        'Te sentís cómodo en la naturaleza.',
        'Buscás un desafío físico real.',
      ],
      approach: [
        'Grupos pequeños.',
        'Atención personalizada, tanto antes como durante la travesía.',
      ],
    },
    checklist: {
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
    },
    meals: { footnote: '*Las imágenes son a modo de ilustración.' },
  },
  {
    slug: 'lago-lolog-laguna-verde',
    visible: true,
    name: 'Lago Lolog a Laguna Verde',
    shortName: 'Lago Lolog',
    destination: 'Neuquén · Huella Andina',
    days: 4,
    nights: 3,
    difficulty: 'media',
    distanceKm: 44,
    photo: toPhotoRecord(PHOTOS.volcanicPlain),
    description:
      'El tramo conecta Lago Lolog con Laguna Verde, atravesando algunos de los paisajes más imponentes de la región. Une lagos, bosques y volcanes en un itinerario exigente pero profundamente gratificante.',
    cover: {
      eyebrow: 'Neuquén · Huella Andina',
      titleRest: 'Lago Lolog a Laguna Verde',
      subtitle: 'Bosques, volcanes y lagos…',
    },
    overview: {
      paragraphs: [
        'Este recorrido, ubicado en la provincia de Neuquén, forma parte de la Huella Andina, un sendero de largo recorrido que une parajes del norte patagónico a través de la montaña.',
        'El tramo conecta Lago Lolog con Laguna Verde, atravesando algunos de los paisajes más imponentes de la región. Une lagos, bosques y volcanes en un itinerario exigente pero profundamente gratificante.',
        'La travesía recorre bosques puros de raulíes, ñires y lengas, cruza escoriales de lava del volcán Achen Ñiyeu y valles con vistas únicas del Lanín y el Villarrica.',
        'Caminaremos por senderos poco transitados, durmiendo en carpa y viviendo la experiencia de autosuficiencia en la montaña.',
        'Es un recorrido ideal para quienes buscan una experiencia auténtica, lejos de los circuitos turísticos clásicos, con la posibilidad de conocer la geografía, la ecología y la fuerza volcánica que da forma a este rincón único de la Patagonia.',
      ],
      modality:
        'Modalidad: travesía con mochila completa y pernocte en campamento. Dificultad media (etapas largas, con desnivel y terreno variado).',
    },
    // `lologStats` (`dc.html:689`): en vez de la cumbre lleva el desnivel
    // acumulado, que coincide con la suma del itinerario (570 + 310 + 530 + 490).
    stats: {
      mode: 'custom',
      items: [
        { value: 44, suffix: ' km', label: 'Distancia total' },
        { value: 1900, prefix: '+', suffix: ' m', label: 'Desnivel positivo acumulado' },
        { value: 4, suffix: ' días', label: 'De travesía' },
        { value: 3, suffix: ' noches', label: 'En campamento' },
      ],
    },
    // `itinerario` (`dc.html:690-696`). Las fotos llevan el alt descriptivo de
    // `PHOTOS` y no el tramo como en el diseño: el tramo ya es el título del día.
    itinerary: [
      {
        day: 0,
        title: 'Encuentro y revisión de equipo',
        photo: toPhotoRecord(PHOTOS.lakeshoreRest),
        paragraphs: [
          'Encuentro en el centro de San Martín de los Andes. Presentación de los guías con el grupo y charla técnica: repaso del itinerario, expectativas y condiciones del terreno.',
          'Revisión de equipo personal (calzado, abrigo, mochila) y distribución de equipo grupal (carpas, cocina, etc.).',
        ],
      },
      {
        day: 1,
        title: 'Puerto Arturo – Auquinco',
        photo: toPhotoRecord(PHOTOS.refugeUnderStars.withPosition('center 75%')),
        distanceKm: 12,
        elevationGainM: 570,
        paragraphs: [
          'A las 9:00 partimos desde San Martín de los Andes en un transfer rumbo a Puerto Arturo, donde iniciamos la travesía.',
          'Atravesamos un pintoresco bosque de raulíes, ñires y lengas hasta llegar a Auquinco, donde armamos nuestro primer campamento.',
        ],
      },
      {
        day: 2,
        title: 'Auquinco – Rincón de los Pinos',
        photo: toPhotoRecord(PHOTOS.valleyDescent),
        distanceKm: 11.3,
        elevationGainM: 310,
        paragraphs: [
          'Desde el Portezuelo de Auquinco, el sendero desciende entre lomadas y pequeños cañadones, con vistas abiertas del valle por donde corre el arroyo Auquinco.',
          'Sobre el final avanzamos entre bosques de lengas y claros de pastizales hasta Rincón de los Pinos, ideal para el segundo campamento.',
        ],
      },
      {
        day: 3,
        title: 'Rincón de los Pinos – Cazadores',
        photo: toPhotoRecord(PHOTOS.lakeshoreHorse),
        distanceKm: 10,
        elevationGainM: 530,
        paragraphs: [
          'Retomamos el sendero junto al arroyo Auquinco. El terreno asciende suavemente y deja ver el escorial del volcán Achen Ñiyeu, con vistas del Lanín y el Villarrica.',
          'Llegamos al Refugio Cazadores, una construcción sencilla entre lengas, ideal para descansar antes de seguir rumbo a Laguna Verde.',
        ],
      },
      {
        day: 4,
        title: 'Cazadores – Achen Ñiyeu – Laguna Verde',
        photo: toPhotoRecord(PHOTOS.volcanoView.withPosition('center 30%')),
        distanceKm: 8.8,
        elevationGainM: 490,
        paragraphs: [
          'Último día: bordeamos el escorial del Achen Ñiyeu, un inmenso mar de piedra negra que contrasta con el verde del bosque, con los volcanes Lanín y Villarrica de fondo.',
          'Descendemos a Laguna Verde, donde nos espera el vehículo para regresar a San Martín de los Andes.',
        ],
      },
    ],
    checklist: {
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
    },
    // La nota del diseño decía "En Lago Lolog no incluye…" porque era una sola
    // pensión para los dos viajes; en su propia página ya no hace falta nombrarlo.
    meals: {
      footnote: '*Las imágenes son a modo de ilustración. No incluye día 0 ni la cena del día 4.',
    },
  },
  upcomingTrip({
    slug: 'laguna-negra',
    name: 'Laguna Negra',
    shortName: 'Laguna Negra',
    destination: 'Bariloche',
    days: 2,
    nights: 1,
    distanceKm: 18,
    photo: toPhotoRecord(PHOTOS.refugeUnderStars),
    // En el panel del home, con `center 70%` las caras del grupo quedan
    // detrás del título: más arriba se ve más cielo estrellado.
    panelPosition: 'center 22%',
  }),
  upcomingTrip({
    slug: 'cajon-del-azul',
    name: 'Cajón del Azul y Hielo Azul',
    shortName: 'Cajón del Azul',
    destination: 'El Bolsón',
    days: 3,
    nights: 2,
    distanceKm: 26,
    photo: toPhotoRecord(PHOTOS.riverCrossing),
  }),
];

/** Lo que distingue a un viaje que todavía no tiene programa. */
type UpcomingTripParams = Pick<
  TripRecord,
  'slug' | 'name' | 'shortName' | 'destination' | 'days' | 'nights' | 'distanceKm' | 'photo'
> &
  Partial<Pick<TripRecord, 'panelPosition'>>;

/**
 * Un viaje que todavía no tiene programa (Laguna Negra, Cajón del Azul): solo
 * lo del catálogo y "Itinerario próximamente". Sin datos inventados: no lleva
 * "¿Puedo?", checklist ni pensión hasta que el cliente los pase.
 */
function upcomingTrip(params: UpcomingTripParams): TripRecord {
  const difficulty = 'media';
  const duration = new TripDuration(params.days, params.nights).sentence();
  const facts = `${duration}, ${formatKilometers(params.distanceKm)} y ${difficultyLabel(difficulty).toLocaleLowerCase('es-AR')}`;
  return {
    ...params,
    visible: true,
    difficulty,
    description: `${params.name} (${params.destination}): ${facts}. Escribinos y te contamos las fechas, la disponibilidad y todo lo que incluye.`,
    cover: { eyebrow: params.destination, titleRest: params.name },
    overview: { paragraphs: [] },
    // Las noches van con un rótulo genérico: todavía no está definido dónde se duerme.
    stats: { mode: 'auto', nightsLabel: 'En la montaña' },
    itinerary: [],
  };
}
