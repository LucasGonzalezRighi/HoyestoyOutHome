import type { WhatsAppLink } from '../contact/WhatsAppLink';
import { formatKilometers } from '../shared/formatters';
import { assertPositive, assertText } from '../shared/invariants';
import type { Photo } from '../shared/Photo';
import type { Price } from '../shared/Price';

import { difficultyLabel, isDifficulty, type Difficulty } from './Difficulty';
import type { TripDuration } from './TripDuration';

/**
 * Identificadores de los viajes. Es una unión cerrada a propósito: un
 * `tripCatalog.get('calle-stepanek')` con un typo no compila. Sumar un viaje
 * es sumar su slug acá.
 */
export const TRIP_SLUGS = ['calle-stepanek', 'lolog', 'laguna-negra', 'cajon-del-azul'] as const;

/** Slug de un viaje del catálogo (`'calle-stepanek'`, `'lolog'`…). */
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
  /** Nombre corto (pestañas, testimonios, cierre): "Calle & Stepanek". */
  shortName: string;
  /** Provincia y lugar: "Mendoza · Vallecitos". */
  destination: string;
  duration: TripDuration;
  difficulty: Difficulty;
  /** Distancia total a pie, en km. */
  distanceKm: number;
  price: Price;
  photo: Photo;
  /** Ancla de la sección propia del viaje (`#calle`). Sin ella, el viaje se consulta por WhatsApp. */
  detailAnchor?: string;
};

/**
 * A dónde lleva el botón de la card de un viaje.
 *
 * - `detail`: a su sección dentro de la landing (misma pestaña).
 * - `inquiry`: al chat de WhatsApp (pestaña nueva).
 *
 * `kind` existe para que el contenido elija el texto del botón ("Ver viaje" /
 * "Consultar") sin que el dominio tenga copys de UI.
 */
export type TripCallToAction =
  | { readonly kind: 'detail'; readonly href: string; readonly external: false }
  | { readonly kind: 'inquiry'; readonly href: string; readonly external: true };

/** Un ancla válida: `#` seguido de un id sin espacios. */
const ANCHOR_PATTERN = /^#[\w-]+$/;

/**
 * Un viaje del catálogo (entidad: se identifica por su `slug`).
 *
 * Junta los value objects que lo describen (duración, precio, foto) y decide
 * lo único que depende del viaje en sí: cómo se muestra su distancia y
 * dificultad, y si su botón lleva a una sección propia o a WhatsApp.
 */
export class Trip {
  private readonly props: Readonly<TripParams>;

  constructor(params: TripParams) {
    const { slug, name, shortName, destination, difficulty, distanceKm, detailAnchor } = params;
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
    if (detailAnchor !== undefined && !ANCHOR_PATTERN.test(detailAnchor)) {
      throw new Error(
        `El ancla del viaje "${slug}" tiene que ser "#id" (llegó ${JSON.stringify(detailAnchor)}). Usá anchorTo().`,
      );
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

  get detailAnchor(): string | undefined {
    return this.props.detailAnchor;
  }

  /** Tiene sección propia en la landing (Calle & Stepanek, Lolog). */
  get hasDetail(): boolean {
    return this.props.detailAnchor !== undefined;
  }

  /** `"24 km"`. */
  distanceLabel(): string {
    return formatKilometers(this.props.distanceKm);
  }

  /** `"Dificultad media"`. */
  difficultyLabel(): string {
    return difficultyLabel(this.props.difficulty);
  }

  /**
   * El destino del botón de la card. Los viajes con sección propia llevan a su
   * ancla; el resto abre el chat de WhatsApp **sin mensaje precargado**, como
   * en el diseño (`https://wa.me/<teléfono>`).
   */
  callToAction(whatsapp: WhatsAppLink): TripCallToAction {
    const { detailAnchor } = this.props;
    return detailAnchor === undefined
      ? { kind: 'inquiry', href: whatsapp.chatHref(), external: true }
      : { kind: 'detail', href: detailAnchor, external: false };
  }
}
