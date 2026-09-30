import { formatCount, formatKilometers, formatMeters } from '../shared/formatters';
import { assertInteger, assertOptionalPositive, assertText } from '../shared/invariants';

/** Datos para crear un `ScheduleDay`. */
export type ScheduleDayParams = {
  /** Número de día (1, 2, 3…). El cronograma de Calle & Stepanek arranca en 1. */
  day: number;
  /** "Cumbres de La Cadenita". */
  title: string;
  /** Qué se hace ese día. */
  description: string;
  /** Kilómetros caminados. */
  distanceKm?: number;
  /** Desnivel positivo, en metros. */
  elevationGainM?: number;
  /** Horas de marcha. */
  walkingHours?: number;
};

/**
 * Un día del cronograma de Calle & Stepanek (sección 04 del diseño).
 *
 * Las stats son opcionales porque el día de regreso no tiene caminata: el
 * diseño lo muestra sin tags (`stats: null`).
 */
export class ScheduleDay {
  private readonly props: Readonly<ScheduleDayParams>;

  constructor(params: ScheduleDayParams) {
    const { day, title, description, distanceKm, elevationGainM, walkingHours } = params;
    assertInteger(day, 'El día del cronograma', { min: 1 });
    assertText(title, `El título del día ${day}`);
    assertText(description, `La descripción del día ${day}`);
    assertOptionalPositive(distanceKm, `La distancia del día ${day}`);
    assertOptionalPositive(elevationGainM, `El desnivel del día ${day}`);
    assertOptionalPositive(walkingHours, `Las horas de marcha del día ${day}`);
    this.props = Object.freeze({ ...params });
  }

  get day(): number {
    return this.props.day;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
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

  /** Tiene al menos una stat para mostrar como tag. */
  get hasStats(): boolean {
    return this.statLabels().length > 0;
  }

  /** El número del círculo de la línea de tiempo: `"1"`. */
  dayLabel(): string {
    return String(this.props.day);
  }

  /**
   * Los tags del día, en el orden del diseño y solo los que existen:
   * `["4 km", "280 m desnivel", "2 hs de marcha"]`, `["13 km", "1.400 m desnivel", …]`.
   */
  statLabels(): readonly string[] {
    const { distanceKm, elevationGainM, walkingHours } = this.props;
    const labels: string[] = [];
    if (distanceKm !== undefined) labels.push(formatKilometers(distanceKm));
    if (elevationGainM !== undefined) labels.push(`${formatMeters(elevationGainM)} desnivel`);
    if (walkingHours !== undefined) {
      // "h" / "hs": la abreviatura rioplatense de horas que usa el diseño.
      labels.push(`${formatCount(walkingHours, 'h', 'hs')} de marcha`);
    }
    return labels;
  }
}
