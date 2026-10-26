import { formatKilometers, formatMeters } from '../shared/formatters';
import { assertInteger, assertPositive, assertText } from '../shared/invariants';
import type { Photo } from '../shared/Photo';
import type { Price } from '../shared/Price';

import { difficultyLabel, isDifficulty, type Difficulty } from './Difficulty';
import type { TripDuration } from './TripDuration';

/**
 * Slug de un viaje: el identificador del catálogo y el último tramo de la URL
 * de su página (`/viajes/<slug>`, la arma `tripPath()` de `constants/routes.ts`).
 *
 * Es un string abierto y no una unión cerrada porque los viajes se crean desde
 * el panel de administración: lo que se valida es el formato (`isTripSlug`).
 */
export type TripSlug = string;

/** Minúsculas, dígitos y guiones sueltos: sirve tal cual como tramo de URL. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Largo máximo de un slug: una URL que se puede leer y compartir. */
export const TRIP_SLUG_MAX_LENGTH = 80;

/**
 * Guarda de formato para slugs que llegan sin tipar (un parámetro de URL, el
 * panel de administración): `'calle-stepanek'` sí, `'Calle Stepanek'` no.
 */
export function isTripSlug(value: string): value is TripSlug {
  return value.length <= TRIP_SLUG_MAX_LENGTH && SLUG_PATTERN.test(value);
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
    // why: los viajes llegan del panel de administración (sin tipar): un slug
    // con espacios o mayúsculas rompería la URL de la página del viaje.
    if (!isTripSlug(slug)) {
      throw new Error(
        `El slug de viaje ${JSON.stringify(slug)} no sirve como URL: van minúsculas, números y guiones.`,
      );
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
