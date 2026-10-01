import { formatNumber } from '../shared/formatters';
import { assertInteger, assertText } from '../shared/invariants';

/** Datos para crear una `Metric`. */
export type MetricParams = {
  /** El número: un entero ≥ 0 (lo anima el contador, que muestra enteros). */
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
 * que sube.
 *
 * Invariante: `value` es un entero ≥ 0, porque el contador anima enteros.
 * Siempre sube (de 0 a `value`) y redondea cada paso al entero, también el
 * último: una stat de `11.3` se leería "11,3 km" sin JS y "11 km" con el
 * motor. La clase promete solo lo que la UI puede mostrar igual en los dos casos.
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
