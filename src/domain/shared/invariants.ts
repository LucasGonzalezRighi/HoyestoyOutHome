/**
 * Guardas que usan los constructores del dominio para validar sus invariantes.
 *
 * Existen para que todos los errores digan lo mismo de la misma forma: qué
 * dato falló y qué valor llegó. El contenido es estático y se prerenderiza,
 * así que un error acá salta en el build o en los tests, nunca en el navegador
 * de alguien — por eso se prefiere tirar antes que "arreglar" el dato en
 * silencio.
 *
 * `what` es el nombre del dato con su artículo y en mayúscula ("El nombre del
 * viaje"), para que el mensaje se lea como una oración.
 */

/** Exige un texto con contenido (no vacío ni solo espacios). Devuelve el valor tal cual. */
export function assertText(value: string, what: string): string {
  if (value.trim() === '') {
    throw new Error(`${what} no puede quedar en blanco.`);
  }
  return value;
}

/** Rango inclusivo para `assertInteger`. Sin `max`, no hay tope. */
export type IntegerRange = { readonly min?: number; readonly max?: number };

/** Exige un entero dentro del rango (inclusivo). */
export function assertInteger(value: number, what: string, range: IntegerRange = {}): number {
  const { min, max } = range;
  const outOfRange = (min !== undefined && value < min) || (max !== undefined && value > max);
  if (!Number.isInteger(value) || outOfRange) {
    throw new Error(
      `${what} tiene que ser un número entero${describeRange(range)} (llegó ${value}).`,
    );
  }
  return value;
}

/** Exige un número finito mayor que 0 (distancias, desniveles, horas). */
export function assertPositive(value: number, what: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${what} tiene que ser un número mayor que 0 (llegó ${value}).`);
  }
  return value;
}

/** Como `assertPositive`, pero el dato es opcional: `undefined` pasa sin validar. */
export function assertOptionalPositive(
  value: number | undefined,
  what: string,
): number | undefined {
  return value === undefined ? undefined : assertPositive(value, what);
}

/**
 * Exige una lista con al menos un elemento y sin textos en blanco.
 *
 * Devuelve una **copia congelada**: los getters la exponen tal cual, y así
 * nadie puede empujarle un ítem desde afuera y cambiar la instancia.
 */
export function assertTextList(values: readonly string[], what: string): readonly string[] {
  if (values.length === 0) {
    throw new Error(`${what} tiene que tener al menos un elemento.`);
  }
  values.forEach((value, index) => {
    if (value.trim() === '') {
      throw new Error(`${what} tiene un elemento en blanco (posición ${index}).`);
    }
  });
  return Object.freeze([...values]);
}

function describeRange({ min, max }: IntegerRange): string {
  if (min !== undefined && max !== undefined) return ` entre ${min} y ${max}`;
  if (min !== undefined) return ` mayor o igual a ${min}`;
  if (max !== undefined) return ` menor o igual a ${max}`;
  return '';
}
