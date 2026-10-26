import { z } from 'zod';

import { DIFFICULTIES, isTripSlug, TRIP_SLUG_MAX_LENGTH } from '@/domain';

/*
 * El contenido editable del sitio como datos planos (JSON): lo que guarda la
 * base y lo que edita el panel de administración.
 *
 * Es la frontera con el mundo sin tipar: todo lo que llega del panel o de la
 * base pasa por estos esquemas antes de convertirse en clases del dominio
 * (`content/index.ts` › `buildSiteContent`). Los topes de largo no son del
 * diseño: frenan un pegado accidental de un texto enorme que rompería la
 * página.
 */

// Los mensajes que no se escriben a mano abajo (un tipo equivocado, una opción
// que no existe) salen en castellano: los lee la persona que usa el panel.
z.config(z.locales.es());

/* ── Piezas comunes ────────────────────────────────────────────────────── */

/** Un texto obligatorio, sin espacios de más, de hasta `max` caracteres. */
function text(max: number) {
  return z
    .string()
    .trim()
    .min(1, 'Este campo no puede quedar vacío.')
    .max(max, `Máximo ${max} caracteres.`);
}

/** Un texto opcional: vacío o solo espacios cuenta como "no está". */
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .transform((value) => (value === '' ? undefined : value))
    .optional();
}

/** Una lista de textos obligatorios, de hasta `maxItems` elementos. */
function textList(maxLength: number, maxItems: number) {
  return z.array(text(maxLength)).max(maxItems, `Máximo ${maxItems} elementos.`);
}

/** Un entero en un rango. */
function integer(min: number, max: number) {
  return z
    .number('Tiene que ser un número.')
    .int('Tiene que ser un número entero.')
    .min(min, `El mínimo es ${min}.`)
    .max(max, `El máximo es ${max}.`);
}

/** Un número positivo (admite decimales: "11,3 km"). */
function positive(max: number) {
  return z
    .number('Tiene que ser un número.')
    .positive('Tiene que ser mayor que 0.')
    .max(max, `El máximo es ${max}.`);
}

/**
 * Identificador de un elemento de una lista (una salida, una pregunta). Lo
 * genera el panel (`crypto.randomUUID()`) y sirve de `key` y para borrar.
 */
export const recordIdSchema = z.string().regex(/^[a-z0-9-]{1,64}$/, 'Identificador inválido.');

/**
 * Encuadre de una foto (`object-position`): palabras clave y porcentajes,
 * nada más ("center 62%", "center top"). Se escribe en un `style`, así que no
 * se acepta cualquier cosa.
 */
export const photoPositionSchema = z
  .string()
  .trim()
  .max(40)
  .regex(/^[a-z0-9%.\s-]+$/, 'Encuadre inválido.');

/**
 * De dónde puede venir una foto: las de `public/images/`, las que sube el
 * panel en desarrollo (`/uploads/`) y las de Vercel Blob. `next/image` solo
 * acepta esos orígenes (`images.remotePatterns` en `next.config.ts`).
 */
const PHOTO_SRC_PATTERN =
  /^(\/(images|uploads)\/[\w./-]+|https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[\w./-]+)$/;

/** Una foto: ruta, medidas del archivo, texto alternativo y encuadre. */
export const photoSchema = z.object(
  {
    src: z.string().max(500).regex(PHOTO_SRC_PATTERN, 'La foto no es de un origen permitido.'),
    width: integer(1, 20000),
    height: integer(1, 20000),
    alt: z.string().trim().max(300, 'Máximo 300 caracteres.'),
    position: photoPositionSchema.optional(),
  },
  { error: (issue) => (issue.input === undefined ? 'Falta subir la foto.' : 'Foto inválida.') },
);

/** Fecha de calendario `AAAA-MM-DD` (sin hora: una salida es un día). */
export const isoDateSchema = z.iso.date('Fecha inválida (AAAA-MM-DD).');

/* ── Viajes ────────────────────────────────────────────────────────────── */

/** Un día del cronograma. Las stats son opcionales: el día de regreso no camina. */
export const itineraryDaySchema = z.object({
  day: integer(0, 60),
  title: text(120),
  paragraphs: textList(1500, 10).min(1, 'Escribí al menos un párrafo.'),
  distanceKm: positive(500).optional(),
  elevationGainM: positive(9000).optional(),
  walkingHours: positive(48).optional(),
  photo: photoSchema.optional(),
});

/** Una stat con contador de "Sobre el viaje": "+1.900 m · Desnivel positivo acumulado". */
export const metricSchema = z.object({
  value: integer(0, 1_000_000),
  prefix: z.string().max(10).optional(),
  suffix: z.string().max(20).optional(),
  label: text(60),
});

/** Un dato de "¿Puedo?": "Clima" → "Cambiante". */
export const factSchema = z.object({ label: text(40), value: text(120) });

/** "¿Puedo?" y "¿Es para mí?". */
export const tripFitSchema = z.object({
  requirementsLead: text(500),
  facts: z.array(factSchema).max(10),
  audienceLead: text(500),
  ideal: textList(200, 12),
  approach: textList(200, 12),
});

/** "¿Qué incluye y qué necesito?": los cinco grupos (alguno puede quedar vacío). */
export const tripChecklistSchema = z
  .object({
    included: textList(160, 40),
    transfers: textList(160, 40),
    notIncluded: textList(160, 40),
    clothing: textList(160, 40),
    gear: textList(160, 40),
  })
  .refine((groups) => Object.values(groups).some((items) => items.length > 0), {
    message: 'La lista de qué incluye necesita al menos un elemento.',
  });

/**
 * Las stats de "Sobre el viaje". `auto` las calcula de los datos del viaje
 * (distancia, días, noches y cumbre) con el rótulo de las noches; `custom`
 * usa las que se cargan a mano (Lago Lolog: desnivel acumulado en vez de
 * cumbre).
 */
export const tripStatsSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('auto'), nightsLabel: text(40) }),
  z.object({ mode: z.literal('custom'), items: z.array(metricSchema).min(1).max(6) }),
]);

/** Todo lo editable de un viaje: los datos del catálogo y el contenido de su página. */
export const tripRecordSchema = z
  .object({
    slug: z
      .string()
      .max(TRIP_SLUG_MAX_LENGTH)
      .refine(isTripSlug, 'Solo minúsculas, números y guiones (ej.: cerro-plata).'),
    /** Oculto: no aparece en el home, el calendario ni el sitemap, y su página da 404. */
    visible: z.boolean(),
    name: text(120),
    shortName: text(60),
    destination: text(80),
    days: integer(1, 60),
    nights: integer(0, 60),
    difficulty: z.enum(DIFFICULTIES),
    distanceKm: positive(2000),
    summitElevationM: integer(1, 9000).optional(),
    /** No se muestra en el sitio (pedido del cliente): queda guardado por si vuelve. */
    priceArs: integer(1, 1_000_000_000).optional(),
    /** Foto del viaje: portada de su página, panel del home y la que se comparte. */
    photo: photoSchema,
    /** Encuadre de la foto en el panel del home, si no es el de la portada. */
    panelPosition: photoPositionSchema.optional(),
    /** Descripción para buscadores y para compartir el link. */
    description: text(300),
    cover: z.object({
      eyebrow: text(80),
      titleAccent: optionalText(60),
      titleRest: text(120),
      subtitle: optionalText(120),
    }),
    overview: z.object({
      paragraphs: textList(1500, 12),
      highlight: optionalText(300),
      modality: optionalText(400),
    }),
    stats: tripStatsSchema,
    itinerary: z.array(itineraryDaySchema).max(30),
    fit: tripFitSchema.optional(),
    checklist: tripChecklistSchema.optional(),
    /** Pensión completa: la nota del asterisco. Sin esto, la página no muestra el bloque. */
    meals: z.object({ footnote: text(300) }).optional(),
  })
  .refine((trip) => trip.nights <= trip.days, {
    message: 'Las noches no pueden ser más que los días.',
    path: ['nights'],
  });

/* ── Salidas, preguntas y testimonios ──────────────────────────────────── */

/** Una salida del calendario: qué viaje y qué día sale (el regreso lo da la duración). */
export const departureRecordSchema = z.object({
  id: recordIdSchema,
  tripSlug: z.string().refine(isTripSlug, 'Viaje inválido.'),
  startsOn: isoDateSchema,
});

/** Una pregunta frecuente. */
export const faqRecordSchema = z.object({
  id: recordIdSchema,
  question: text(200),
  answer: text(1500),
});

/** Un testimonio de la cinta. */
export const testimonialRecordSchema = z.object({
  id: recordIdSchema,
  quote: text(400),
  author: text(60),
  city: text(60),
  /** Nombre corto del viaje que hizo, tal cual se muestra ("Calle & Stepanek"). */
  tripName: text(60),
  rating: integer(1, 5),
});

/* ── Textos del home ───────────────────────────────────────────────────── */

/** Los textos del home que se editan desde el panel. El resto es copy fijo de `content/sections/`. */
export const homeTextsSchema = z.object({
  hero: z.object({
    /** El titular en sus dos renglones (en escritorio, uno por línea). */
    headline: z.tuple([text(80), text(80)]),
    /** La bajada, un renglón por elemento. */
    lead: textList(120, 3).min(1, 'Escribí al menos un renglón.'),
    /** Las palabras de la cinta que sigue al hero. */
    ribbon: textList(40, 12).min(1, 'La cinta necesita al menos una palabra.'),
  }),
  whyUs: z.object({
    title: text(120),
    pillars: z
      .array(z.object({ title: text(60), description: text(200) }))
      .min(1)
      .max(6),
  }),
  trips: z.object({ title: text(80), lead: text(300) }),
  calendar: z.object({
    title: text(80),
    lead: text(300),
    /** Aviso visible arriba del calendario. Vacío: no se muestra. */
    note: optionalText(300),
  }),
  testimonials: z.object({ title: text(80) }),
  faq: z.object({
    title: text(120),
    lead: text(300),
    summitTitle: text(120),
    summitLead: text(300),
  }),
  contact: z.object({ title: text(80), lead: text(300) }),
});

/* ── Todo junto ────────────────────────────────────────────────────────── */

/** Versión del formato del contenido guardado: si cambia la forma, se migra con esto. */
export const SITE_RECORD_SCHEMA_VERSION = 1;

/**
 * Todo el contenido editable. Los viajes van en el orden en que se muestran.
 * Valida además lo que cruza listas: slugs únicos y salidas de viajes que existen.
 */
export const siteRecordSchema = z
  .object({
    schemaVersion: z.literal(SITE_RECORD_SCHEMA_VERSION),
    trips: z.array(tripRecordSchema).max(40),
    departures: z.array(departureRecordSchema).max(300),
    faq: z.array(faqRecordSchema).max(40),
    testimonials: z.array(testimonialRecordSchema).max(40),
    home: homeTextsSchema,
  })
  .superRefine((site, context) => {
    const slugs = new Set<string>();
    site.trips.forEach((trip, index) => {
      if (slugs.has(trip.slug)) {
        context.addIssue({
          code: 'custom',
          path: ['trips', index, 'slug'],
          message: `Ya hay un viaje con la dirección "${trip.slug}".`,
        });
      }
      slugs.add(trip.slug);
    });
    const seen = new Set<string>();
    site.departures.forEach((departure, index) => {
      if (!slugs.has(departure.tripSlug)) {
        context.addIssue({
          code: 'custom',
          path: ['departures', index, 'tripSlug'],
          message: `La salida del ${departure.startsOn} es de un viaje que no existe.`,
        });
      }
      const key = `${departure.tripSlug}-${departure.startsOn}`;
      if (seen.has(key)) {
        context.addIssue({
          code: 'custom',
          path: ['departures', index, 'startsOn'],
          message: `Ese viaje ya tiene una salida el ${departure.startsOn}.`,
        });
      }
      seen.add(key);
    });
  });

/** Una foto guardada. */
export type PhotoRecord = z.infer<typeof photoSchema>;
/** Un día del cronograma guardado. */
export type ItineraryDayRecord = z.infer<typeof itineraryDaySchema>;
/** Una stat con contador guardada. */
export type MetricRecord = z.infer<typeof metricSchema>;
/** "¿Puedo?" / "¿Es para mí?" guardados. */
export type TripFitRecord = z.infer<typeof tripFitSchema>;
/** La checklist guardada. */
export type TripChecklistRecord = z.infer<typeof tripChecklistSchema>;
/** Las stats de "Sobre el viaje" guardadas. */
export type TripStatsRecord = z.infer<typeof tripStatsSchema>;
/** Un viaje guardado. */
export type TripRecord = z.infer<typeof tripRecordSchema>;
/** Una salida guardada. */
export type DepartureRecord = z.infer<typeof departureRecordSchema>;
/** Una pregunta frecuente guardada. */
export type FaqRecord = z.infer<typeof faqRecordSchema>;
/** Un testimonio guardado. */
export type TestimonialRecord = z.infer<typeof testimonialRecordSchema>;
/** Los textos del home guardados. */
export type HomeTextsRecord = z.infer<typeof homeTextsSchema>;
/** Todo el contenido editable guardado. */
export type SiteRecord = z.infer<typeof siteRecordSchema>;
