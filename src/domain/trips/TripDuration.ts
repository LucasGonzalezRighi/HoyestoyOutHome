import { formatCount } from '../shared/formatters';
import { assertInteger } from '../shared/invariants';

/**
 * Duración de un viaje en días y noches.
 *
 * Invariantes: los dos son enteros ≥ 0 y nunca hay más noches que días (la
 * última jornada siempre es de regreso). Se muestra de dos formas porque el
 * diseño usa las dos: `label()` en las cards de viajes y `sentence()` en los
 * tags y el cronograma de Calle & Stepanek.
 */
export class TripDuration {
  private readonly props: Readonly<{ days: number; nights: number }>;

  constructor(days: number, nights: number) {
    assertInteger(days, 'Los días del viaje', { min: 0 });
    assertInteger(nights, 'Las noches del viaje', { min: 0 });
    if (nights > days) {
      throw new Error(
        `Un viaje no puede tener más noches que días (llegó ${days} días y ${nights} noches).`,
      );
    }
    this.props = Object.freeze({ days, nights });
  }

  get days(): number {
    return this.props.days;
  }

  get nights(): number {
    return this.props.nights;
  }

  /** `"4 días / 3 noches"`, `"2 días / 1 noche"` — formato de las cards de viajes. */
  label(): string {
    return this.parts().join(' / ');
  }

  /** `"4 días, 3 noches"` — formato de los tags y del subtítulo del cronograma. */
  sentence(): string {
    return this.parts().join(', ');
  }

  private parts(): [string, string] {
    return [
      formatCount(this.props.days, 'día', 'días'),
      formatCount(this.props.nights, 'noche', 'noches'),
    ];
  }
}
