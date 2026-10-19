import { formatKilometers, formatMeters } from '../shared/formatters';
import { assertInteger, assertPositive, assertText } from '../shared/invariants';
import type { Photo } from '../shared/Photo';
import type { Price } from '../shared/Price';

import { difficultyLabel, isDifficulty, type Difficulty } from './Difficulty';
import type { TripDuration } from './TripDuration';

/**
 * Identificadores de los viajes. Es una unión cerrada a propósito: un
 * `tripCatalog.get('calle-stepanek')` con un typo no compila. Sumar un viaje
 * es sumar su slug acá.
 *
 * Cada slug es también el último tramo de la URL de la página del viaje
 * (`/viajes/<slug>`, la arma `tripPath()` de `constants/routes.ts`): por eso
 * van en minúsculas, sin espacios ni `&`.
 */
export const TRIP_SLUGS = [
  'calle-stepanek',
  'lago-lolog-laguna-verde',
  'laguna-negra',
  'cajon-del-azul',
] as const;

/** Slug de un viaje del catálogo (`'calle-stepanek'`, `'lago-lolog-laguna-verde'`…). */
export type TripSlug = (typeof TRIP_SLUGS)[number];

/** Guarda de tipo para slugs que llegan sin tipar (un parámetro de URL, un CMS). */
export function isTripSlug(value: string): value is TripSlug {
  return (TRIP_SLUGS as readonly string[]).includes(value);
}

/** Datos para crear un `Trip`. */
export type TripParams = {
  slug: TripSlug;
  /** Nombre completo (título de la card): "Calle & Stepanek — Tu primer 4mil". */
  name: string;
  /** Nombre corto (testimonios, calendario, mensajes): "Calle & Stepanek". */
  shortName: string;
  /** Provincia y lugar: "Mendoza · Vallecitos". */
  destination: string;
  duration: TripDuration;
  difficulty: Difficulty;
  /** Distancia total a pie, en km. */
  distanceKm: number;
  price: Price;
  photo: Photo;
  /**
   * Altura de la cumbre más alta del viaje, en metros sobre el nivel del mar
   * (entero > 0). Solo la tienen los viajes de ascenso: Calle & Stepanek, 4290.
   */
  summitElevationM?: number;
};

/**
 * Un viaje del catálogo (entidad: se identifica por su `slug`).
 *
 * Junta los value objects que lo describen (duración, precio, foto) y formatea
 * lo que depende del viaje en sí: distancia, dificultad y cumbre.
 *
 * Todos los viajes tienen página propia. El dominio no conoce rutas: la URL la
 * arma `tripPath(trip.slug)` de `constants/routes.ts`.
 */
export class Trip {
  private readonly props: Readonly<TripParams>;

  constructor(params: TripParams) {
    const { slug, name, shortName, destination, difficulty, distanceKm, summitElevationM } = params;
    // why: el slug y la dificultad ya los garantiza el tipo, pero si mañana los
    // viajes vienen de un CMS el dato llega sin tipar y esto es lo que lo frena.
    if (!isTripSlug(slug)) {
      throw new Error(`El slug de viaje ${JSON.stringify(slug)} no está en TRIP_SLUGS.`);
    }
    assertText(name, `El nombre del viaje "${slug}"`);
    assertText(shortName, `El nombre corto del viaje "${slug}"`);
    assertText(destination, `El destino del viaje "${slug}"`);
    if (!isDifficulty(difficulty)) {
      throw new Error(
        `La dificultad del viaje "${slug}" no existe (llegó ${JSON.stringify(difficulty)}).`,
      );
    }
    assertPositive(distanceKm, `La distancia del viaje "${slug}"`);
    if (summitElevationM !== undefined) {
      assertInteger(summitElevationM, `La altura de la cumbre del viaje "${slug}"`, { min: 1 });
    }
    this.props = Object.freeze({ ...params });
  }

  get slug(): TripSlug {
    return this.props.slug;
  }

  get name(): string {
    return this.props.name;
  }

  get shortName(): string {
    return this.props.shortName;
  }

  get destination(): string {
    return this.props.destination;
  }

  get duration(): TripDuration {
    return this.props.duration;
  }

  get difficulty(): Difficulty {
    return this.props.difficulty;
  }

  get distanceKm(): number {
    return this.props.distanceKm;
  }

  get price(): Price {
    return this.props.price;
  }

  get photo(): Photo {
    return this.props.photo;
  }

  /** Altura de la cumbre más alta, en metros, o `undefined` si el viaje no es de ascenso. */
  get summitElevationM(): number | undefined {
    return this.props.summitElevationM;
  }

  /** `"24 km"`. */
  distanceLabel(): string {
    return formatKilometers(this.props.distanceKm);
  }

  /** `"Dificultad media"`. */
  difficultyLabel(): string {
    return difficultyLabel(this.props.difficulty);
  }

  /** `"Cumbre 4.290 m"`, o `undefined` si el viaje no tiene cumbre. */
  summitLabel(): string | undefined {
    const { summitElevationM } = this.props;
    return summitElevationM === undefined ? undefined : `Cumbre ${formatMeters(summitElevationM)}`;
  }
}
