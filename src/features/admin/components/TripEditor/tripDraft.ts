import type {
  MetricRecord,
  TripChecklistRecord,
  TripFitRecord,
  TripRecord,
} from '@/content/records/schema';

/*
 * El estado del editor de un viaje y cómo se convierte en lo que se guarda.
 *
 * Los bloques opcionales ("¿Puedo?", qué incluye, pensión) y las stats tienen
 * su borrador aparte de si están prendidos: apagar un bloque y volver a
 * prenderlo no pierde lo escrito.
 */

/** Los datos del viaje sin los bloques que se prenden y apagan. */
export type TripBase = Omit<TripRecord, 'stats' | 'fit' | 'checklist' | 'meals'>;

/** Todo lo que edita el editor de un viaje. */
export type TripDraft = {
  base: TripBase;
  stats: { mode: 'auto' | 'custom'; nightsLabel: string; items: MetricRecord[] };
  fit: { enabled: boolean; value: TripFitRecord };
  checklist: { enabled: boolean; value: TripChecklistRecord };
  meals: { enabled: boolean; footnote: string };
};

const EMPTY_FIT: TripFitRecord = {
  requirementsLead: '',
  facts: [],
  audienceLead: '',
  ideal: [],
  approach: [],
};

const EMPTY_CHECKLIST: TripChecklistRecord = {
  included: [],
  transfers: [],
  notIncluded: [],
  clothing: [],
  gear: [],
};

/** La nota de la pensión que llevan todos los viajes. */
const DEFAULT_MEALS_FOOTNOTE = '*Las imágenes son a modo de ilustración.';

/** El rótulo de las noches cuando todavía no se sabe dónde se duerme. */
const DEFAULT_NIGHTS_LABEL = 'En la montaña';

/**
 * Un viaje nuevo: oculto hasta que se lo muestra a propósito, para poder
 * cargarlo de a poco sin que aparezca a medio hacer.
 */
const NEW_TRIP: TripBase = {
  slug: '',
  visible: false,
  name: '',
  shortName: '',
  destination: '',
  days: 2,
  nights: 1,
  difficulty: 'media',
  distanceKm: Number.NaN,
  description: '',
  // why: la foto es obligatoria, pero un viaje nuevo todavía no tiene. El
  // esquema la reclama al guardar ("Falta subir la foto.").
  photo: undefined as unknown as TripRecord['photo'],
  cover: { eyebrow: '', titleRest: '' },
  overview: { paragraphs: [] },
  itinerary: [],
};

/** El borrador de un viaje guardado, o de uno nuevo si no hay. */
export function toDraft(trip: TripRecord | undefined): TripDraft {
  if (!trip) {
    return {
      base: NEW_TRIP,
      stats: { mode: 'auto', nightsLabel: DEFAULT_NIGHTS_LABEL, items: [] },
      fit: { enabled: false, value: EMPTY_FIT },
      checklist: { enabled: false, value: EMPTY_CHECKLIST },
      meals: { enabled: false, footnote: DEFAULT_MEALS_FOOTNOTE },
    };
  }
  const { stats, fit, checklist, meals, ...base } = trip;
  return {
    base,
    stats:
      stats.mode === 'auto'
        ? { mode: 'auto', nightsLabel: stats.nightsLabel, items: [] }
        : { mode: 'custom', nightsLabel: DEFAULT_NIGHTS_LABEL, items: stats.items },
    fit: { enabled: fit !== undefined, value: fit ?? EMPTY_FIT },
    checklist: { enabled: checklist !== undefined, value: checklist ?? EMPTY_CHECKLIST },
    meals: { enabled: meals !== undefined, footnote: meals?.footnote ?? DEFAULT_MEALS_FOOTNOTE },
  };
}

/**
 * Lo que se guarda. La portada usa el destino y el nombre si se dejaron
 * vacíos: un viaje nuevo queda bien sin tener que repetir esos datos.
 */
export function fromDraft({ base, stats, fit, checklist, meals }: TripDraft): TripRecord {
  return {
    ...base,
    cover: {
      ...base.cover,
      eyebrow: base.cover.eyebrow.trim() || base.destination,
      titleRest: base.cover.titleRest.trim() || base.name,
    },
    stats:
      stats.mode === 'auto'
        ? { mode: 'auto', nightsLabel: stats.nightsLabel }
        : { mode: 'custom', items: stats.items },
    ...(fit.enabled ? { fit: fit.value } : {}),
    ...(checklist.enabled ? { checklist: checklist.value } : {}),
    ...(meals.enabled ? { meals: { footnote: meals.footnote } } : {}),
  };
}

/**
 * Un slug a partir del nombre: "Cajón del Azul & Hielo Azul" →
 * "cajon-del-azul-y-hielo-azul". Sin tildes, en minúsculas y con guiones.
 */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' y ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

/** En qué pestaña del editor está cada dato (por el primer tramo de su ruta). */
const TAB_OF_FIELD: Readonly<Record<string, TripTab>> = {
  cover: 'cover',
  overview: 'overview',
  stats: 'overview',
  itinerary: 'itinerary',
  fit: 'fit',
  checklist: 'checklist',
  meals: 'meals',
};

/** Las pestañas del editor. */
export const TRIP_TABS = [
  'basics',
  'cover',
  'overview',
  'itinerary',
  'fit',
  'checklist',
  'meals',
] as const;

/** Una pestaña del editor. */
export type TripTab = (typeof TRIP_TABS)[number];

/** La pestaña de un dato con error (`itinerary.2.title` → `itinerary`). */
export function tabOfPath(path: string): TripTab {
  return TAB_OF_FIELD[path.split('.')[0] ?? ''] ?? 'basics';
}
