import { formatNumber } from './formatters';
import { assertInteger } from './invariants';

/** Pesos en un "mil" del contador del cierre. */
const THOUSAND = 1000;

/**
 * Precio por persona de un viaje, en pesos argentinos.
 *
 * Un viaje tiene precio publicado (`Price.of(690000)`) o se cotiza por
 * WhatsApp (`Price.onRequest()`). Modelarlo como una sola clase evita el
 * `number | null` suelto por los componentes: la card pregunta
 * `price.label()` y no le importa cuál de los dos es.
 *
 * El constructor es privado para que solo se pueda crear por las dos fábricas.
 */
export class Price {
  /** Lo que se muestra cuando el precio no está publicado (cards del diseño). */
  static readonly ON_REQUEST_LABEL = 'Consultar';

  /**
   * Símbolo de la moneda (pesos argentinos). Público porque el precio grande
   * del cierre lo escribe fuera del contador, que solo reescribe los dígitos
   * (`dc.html:367`): así el `$` sale de un solo lugar, el mismo que usa `label()`.
   */
  static readonly CURRENCY_SYMBOL = '$';

  private constructor(private readonly pesos: number | null) {}

  /** Precio publicado, en pesos enteros (sin centavos: así se cobra el viaje). */
  static of(amountInPesos: number): Price {
    return new Price(assertInteger(amountInPesos, 'El precio en pesos', { min: 1 }));
  }

  /** Precio a consultar: se cotiza por WhatsApp. */
  static onRequest(): Price {
    return new Price(null);
  }

  /** El precio no tiene monto: se muestra "Consultar" y se cotiza por WhatsApp. */
  get isOnRequest(): boolean {
    return this.pesos === null;
  }

  /** El monto en pesos. Tira si el precio es a consultar: preguntá `isOnRequest` antes. */
  get amount(): number {
    if (this.pesos === null) {
      throw new Error('El precio es a consultar: no tiene monto. Preguntá `isOnRequest` antes.');
    }
    return this.pesos;
  }

  /** `"$690.000"` o `"Consultar"`. Sin decimales ni espacio después del símbolo, como en el diseño. */
  label(): string {
    return this.pesos === null
      ? Price.ON_REQUEST_LABEL
      : `${Price.CURRENCY_SYMBOL}${formatNumber(this.pesos)}`;
  }

  /**
   * El monto en miles: `690000` → `690`.
   *
   * Lo usa el contador del cierre, que anima `690` y le pega `.000` al final
   * (formato `thousands` de `motion/attributes.ts`). Si el monto no es un
   * número redondo de miles el contador mostraría otro precio, así que tira.
   */
  inThousands(): number {
    const amount = this.amount;
    if (amount % THOUSAND !== 0) {
      throw new Error(
        `El precio ${this.label()} no es un número redondo de miles: el contador no lo puede mostrar.`,
      );
    }
    return amount / THOUSAND;
  }
}
