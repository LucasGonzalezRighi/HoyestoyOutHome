import { formatNumber } from '../shared/formatters';
import { assertText } from '../shared/invariants';

/** Datos para crear una `Metric`. */
export type MetricParams = {
  /** El número (lo anima el contador). */
  value: number;
  /** Texto pegado antes del número: `'+'`. */
  prefix?: string;
  /** Texto después del número, **con su espacio**: `' km'`, `' días'`. */
  suffix?: string;
  /** La bajada de la stat: "Distancia total". */
  label: string;
};

/**
 * Una stat con contador animado (las cards verdes de Lago Lolog: "44 km",
 * "+1.900 m", "4 días", "3 noches").
 *
 * El valor se guarda como número y no como texto porque el contador lo anima
 * de 0 a `value`: el prefijo y el sufijo quedan quietos alrededor del número
 * que sube. Invariante: `value` es finito y ≥ 0 (el contador siempre sube).
 */
export class Metric {
  private readonly props: Readonly<Required<MetricParams>>;

  constructor({ value, prefix = '', suffix = '', label }: MetricParams) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(
        `El valor de la métrica "${label}" tiene que ser un número ≥ 0 (llegó ${value}).`,
      );
    }
    assertText(label, 'La bajada de la métrica');
    this.props = Object.freeze({ value, prefix, suffix, label });
  }

  get value(): number {
    return this.props.value;
  }

  get prefix(): string {
    return this.props.prefix;
  }

  get suffix(): string {
    return this.props.suffix;
  }

  get label(): string {
    return this.props.label;
  }

  /**
   * Solo el número formateado (`"1.900"`): el texto inicial del contador, para
   * que sin JS se lea el valor final.
   */
  formattedValue(): string {
    return formatNumber(this.props.value);
  }

  /** La stat completa: `"+1.900 m"`, `"44 km"`, `"4 días"`. */
  format(): string {
    return `${this.props.prefix}${this.formattedValue()}${this.props.suffix}`;
  }
}
