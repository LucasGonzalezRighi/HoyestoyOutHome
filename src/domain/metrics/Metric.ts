import { formatNumber } from '../shared/formatters';
import { assertInteger, assertText } from '../shared/invariants';

/** Datos para crear una `Metric`. */
export type MetricParams = {
  /** El número: un entero ≥ 0. */
  value: number;
  /** Texto pegado antes del número: `'+'`. */
  prefix?: string;
  /** Texto después del número, **con su espacio**: `' km'`, `' días'`. */
  suffix?: string;
  /** La bajada de la stat: "Distancia total". */
  label: string;
};

/**
 * Una stat de la presentación de un viaje (las cards verdes: "44 km",
 * "+1.900 m", "4 días", "3 noches").
 *
 * El valor se guarda como número y no como texto para formatearlo con los
 * separadores del sitio (`1.900`), con el prefijo y el sufijo alrededor. Las
 * stats se muestran fijas (pedido del cliente, noviembre 2026); en el diseño
 * subían con un contador de 0 a `value`, y por eso la invariante: `value` es
 * un entero ≥ 0 (el contador anima enteros, y así la stat se lee igual con o
 * sin él si vuelve).
 */
export class Metric {
  private readonly props: Readonly<Required<MetricParams>>;

  constructor({ value, prefix = '', suffix = '', label }: MetricParams) {
    assertInteger(value, `El valor de la métrica "${label}"`, { min: 0 });
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

  /** Solo el número formateado, sin prefijo ni sufijo: `"1.900"`. */
  formattedValue(): string {
    return formatNumber(this.props.value);
  }

  /** La stat completa: `"+1.900 m"`, `"44 km"`, `"4 días"`. */
  format(): string {
    return `${this.props.prefix}${this.formattedValue()}${this.props.suffix}`;
  }
}
