import { formatKilometers, formatMeters } from '../shared/formatters';
import {
  assertInteger,
  assertOptionalPositive,
  assertText,
  assertTextList,
} from '../shared/invariants';
import type { Photo } from '../shared/Photo';

/** Datos para crear un `ItineraryStage`. */
export type ItineraryStageParams = {
  /** Número de día. Arranca en 0: el día 0 es el encuentro, sin caminata. */
  day: number;
  /** Tramo: "Puerto Arturo – Auquinco". */
  route: string;
  /** Los párrafos de la card, en orden. */
  paragraphs: readonly string[];
  photo: Photo;
  /** Kilómetros del tramo. Va junto con `elevationGainM`. */
  distanceKm?: number;
  /** Desnivel positivo del tramo, en metros. Va junto con `distanceKm`. */
  elevationGainM?: number;
};

/**
 * Una etapa del itinerario de Lago Lolog (sección 07: las cards apilables).
 *
 * Invariante: distancia y desnivel van **juntos o ninguno**. El diseño los
 * muestra como un par de tags ("Distancia: 12 km" · "Desnivel: +570 m") detrás
 * de un único `if`; una etapa con uno solo dejaría un tag huérfano.
 */
export class ItineraryStage {
  private readonly props: Readonly<ItineraryStageParams>;

  constructor(params: ItineraryStageParams) {
    const { day, route, paragraphs, distanceKm, elevationGainM } = params;
    assertInteger(day, 'El día de la etapa', { min: 0 });
    assertText(route, `El tramo del día ${day}`);
    assertOptionalPositive(distanceKm, `La distancia del día ${day}`);
    assertOptionalPositive(elevationGainM, `El desnivel del día ${day}`);
    if ((distanceKm === undefined) !== (elevationGainM === undefined)) {
      throw new Error(
        `El día ${day} tiene que tener distancia y desnivel juntos, o ninguno de los dos.`,
      );
    }
    this.props = Object.freeze({
      ...params,
      paragraphs: assertTextList(paragraphs, `Los párrafos del día ${day}`),
    });
  }

  get day(): number {
    return this.props.day;
  }

  get route(): string {
    return this.props.route;
  }

  get paragraphs(): readonly string[] {
    return this.props.paragraphs;
  }

  get photo(): Photo {
    return this.props.photo;
  }

  get distanceKm(): number | undefined {
    return this.props.distanceKm;
  }

  get elevationGainM(): number | undefined {
    return this.props.elevationGainM;
  }

  /** Tiene distancia y desnivel (el día 0 no). */
  get hasMetrics(): boolean {
    return this.props.distanceKm !== undefined;
  }

  /** `"Día 0"`, `"Día 1"`… */
  dayLabel(): string {
    return `Día ${this.props.day}`;
  }

  /** `"11,3 km"`. Tira si la etapa no tiene métricas: preguntá `hasMetrics` antes. */
  distanceLabel(): string {
    return formatKilometers(this.requireMetric(this.props.distanceKm));
  }

  /** `"+570 m"` (el `+` es porque es desnivel positivo). Tira si la etapa no tiene métricas. */
  elevationLabel(): string {
    return `+${formatMeters(this.requireMetric(this.props.elevationGainM))}`;
  }

  private requireMetric(value: number | undefined): number {
    if (value === undefined) {
      throw new Error(`El día ${this.props.day} no tiene métricas: preguntá \`hasMetrics\` antes.`);
    }
    return value;
  }
}
