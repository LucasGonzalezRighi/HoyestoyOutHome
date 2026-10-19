import { formatCount, formatKilometers, formatMeters } from '../shared/formatters';
import {
  assertInteger,
  assertOptionalPositive,
  assertText,
  assertTextList,
} from '../shared/invariants';
import type { Photo } from '../shared/Photo';

/**
 * Qué mide una stat del día. Es la clave con la que `content/` elige el
 * rótulo del tag ("Distancia:", "Desnivel:", "Marcha:") y el feature su tinte:
 * el dominio no tiene copys de UI.
 */
export const ITINERARY_STAT_KINDS = ['distance', 'elevationGain', 'walkingTime'] as const;

/** Una de las stats del día: `'distance'`, `'elevationGain'` o `'walkingTime'`. */
export type ItineraryStatKind = (typeof ITINERARY_STAT_KINDS)[number];

/**
 * Una stat del día lista para mostrar, sin rótulo: `{ kind: 'distance', value: '11,3 km' }`.
 * Es un objeto plano, así que puede cruzar a un Client Component.
 */
export type ItineraryStat = {
  readonly kind: ItineraryStatKind;
  /** `"11,3 km"`, `"+570 m"`, `"2 hs"`. */
  readonly value: string;
};

/** Datos para crear un `ItineraryDay`. */
export type ItineraryDayParams = {
  /**
   * Número de día, entero ≥ 0. Calle & Stepanek arranca en 1; Lago Lolog en 0
   * (el día 0 es el encuentro, sin caminata).
   */
  day: number;
  /** "Cumbres de La Cadenita", "Puerto Arturo – Auquinco". */
  title: string;
  /** Qué se hace ese día, un párrafo por elemento y en orden (al menos uno). */
  paragraphs: readonly string[];
  /** Foto del día, si la tiene (cada día de Lolog lleva la suya dentro de la línea de tiempo). */
  photo?: Photo;
  /** Kilómetros caminados. */
  distanceKm?: number;
  /** Desnivel positivo, en metros. */
  elevationGainM?: number;
  /** Horas de marcha. */
  walkingHours?: number;
};

/**
 * Un día del cronograma de un viaje: el ítem de la línea de tiempo de su página.
 *
 * Junta lo que antes eran dos clases (el día del cronograma de Calle &
 * Stepanek y la etapa del itinerario de Lolog): número, título, párrafos, foto
 * opcional y tres stats opcionales e independientes. Las stats son opcionales
 * porque el día de regreso y el día 0 no tienen caminata, y en ese caso el
 * día se muestra sin tags.
 *
 * Formatea las stats de las dos maneras que usa el sitio:
 * - `statLabels()`: tags que se explican solos (`"280 m desnivel"`, `"2 hs de marcha"`).
 * - `stats()`: valor corto y `kind`, para tags con rótulo de `content/`
 *   (`"Desnivel:"` + `"+570 m"`).
 */
export class ItineraryDay {
  private readonly props: Readonly<ItineraryDayParams>;

  constructor(params: ItineraryDayParams) {
    const { day, title, paragraphs, distanceKm, elevationGainM, walkingHours } = params;
    assertInteger(day, 'El día del itinerario', { min: 0 });
    assertText(title, `El título del día ${day}`);
    assertOptionalPositive(distanceKm, `La distancia del día ${day}`);
    assertOptionalPositive(elevationGainM, `El desnivel del día ${day}`);
    assertOptionalPositive(walkingHours, `Las horas de marcha del día ${day}`);
    this.props = Object.freeze({
      ...params,
      paragraphs: assertTextList(paragraphs, `Los párrafos del día ${day}`),
    });
  }

  get day(): number {
    return this.props.day;
  }

  get title(): string {
    return this.props.title;
  }

  /** Los párrafos del día, en orden. La lista está congelada. */
  get paragraphs(): readonly string[] {
    return this.props.paragraphs;
  }

  get photo(): Photo | undefined {
    return this.props.photo;
  }

  get distanceKm(): number | undefined {
    return this.props.distanceKm;
  }

  get elevationGainM(): number | undefined {
    return this.props.elevationGainM;
  }

  get walkingHours(): number | undefined {
    return this.props.walkingHours;
  }

  /** Tiene foto propia. */
  get hasPhoto(): boolean {
    return this.props.photo !== undefined;
  }

  /** Tiene al menos una stat para mostrar como tag (el día de regreso y el día 0, no). */
  get hasStats(): boolean {
    const { distanceKm, elevationGainM, walkingHours } = this.props;
    return distanceKm !== undefined || elevationGainM !== undefined || walkingHours !== undefined;
  }

  /** El número del marcador de la línea de tiempo (el círculo): `"0"`, `"1"`… */
  markerLabel(): string {
    return String(this.props.day);
  }

  /** `"Día 0"`, `"Día 1"`… */
  dayLabel(): string {
    return `Día ${this.props.day}`;
  }

  /** `"11,3 km"`, o `undefined` si el día no tiene distancia. */
  distanceLabel(): string | undefined {
    const { distanceKm } = this.props;
    return distanceKm === undefined ? undefined : formatKilometers(distanceKm);
  }

  /**
   * `"+570 m"` (el `+` es porque es desnivel positivo), o `undefined` si el día
   * no tiene desnivel.
   */
  elevationGainLabel(): string | undefined {
    const { elevationGainM } = this.props;
    return elevationGainM === undefined ? undefined : `+${formatMeters(elevationGainM)}`;
  }

  /** `"2 hs"`, `"1 h"`, o `undefined` si el día no tiene horas de marcha. */
  walkingTimeLabel(): string | undefined {
    const { walkingHours } = this.props;
    // "h" / "hs": la abreviatura rioplatense de horas que usa el diseño.
    return walkingHours === undefined ? undefined : formatCount(walkingHours, 'h', 'hs');
  }

  /**
   * Las stats que tiene el día, en orden fijo (distancia, desnivel, marcha),
   * con su valor corto y su `kind` para que `content/` le ponga el rótulo:
   * `[{ kind: 'distance', value: '12 km' }, { kind: 'elevationGain', value: '+570 m' }]`.
   */
  stats(): readonly ItineraryStat[] {
    const values: Record<ItineraryStatKind, string | undefined> = {
      distance: this.distanceLabel(),
      elevationGain: this.elevationGainLabel(),
      walkingTime: this.walkingTimeLabel(),
    };
    return ITINERARY_STAT_KINDS.flatMap((kind) => {
      const value = values[kind];
      return value === undefined ? [] : [{ kind, value }];
    });
  }

  /**
   * Las stats como tags que se explican solos, en el mismo orden y solo las
   * que existen: `["4 km", "280 m desnivel", "2 hs de marcha"]`,
   * `["13 km", "1.400 m desnivel", "5 hs de marcha"]`.
   */
  statLabels(): readonly string[] {
    const { elevationGainM } = this.props;
    const walkingTime = this.walkingTimeLabel();
    return [
      this.distanceLabel(),
      elevationGainM === undefined ? undefined : `${formatMeters(elevationGainM)} desnivel`,
      walkingTime === undefined ? undefined : `${walkingTime} de marcha`,
    ].filter((label): label is string => label !== undefined);
  }
}
