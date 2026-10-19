import { LOCALE } from './formatters';

/** `YYYY-MM-DD`: fecha de calendario sin hora ni zona horaria. */
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Los formatos de fecha van fijos en UTC, igual que el instante que guarda
 * `CalendarDate`: así el día que se muestra es el del ISO en cualquier huso
 * (el del servidor que prerenderiza o el del navegador). Se crean una vez:
 * crear un `Intl.DateTimeFormat` es caro.
 */
const DAY_MONTH = new Intl.DateTimeFormat(LOCALE, {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
});
const DAY_MONTH_YEAR = new Intl.DateTimeFormat(LOCALE, {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const LONG_MONTH = new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', month: 'long' });
const SHORT_MONTH = new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', month: 'short' });

/**
 * Una fecha de calendario (día, mes y año), sin hora ni zona horaria: la
 * salida de un viaje es "el 13 de noviembre" en Mendoza y en cualquier lado.
 *
 * Value object interno del dominio (el barrel no lo exporta: afuera las
 * fechas viajan como ISO `'2026-11-13'`). Guarda la medianoche UTC de ese día
 * y hace toda la aritmética y el formato en UTC. Un `new Date('2026-11-13')`
 * leído con los métodos locales, o un `new Date(2026, 10, 13)`, se corren un
 * día según el huso de quien lo ejecuta; acá no hay métodos locales.
 */
export class CalendarDate {
  private constructor(private readonly utcMidnight: number) {}

  /**
   * Lee una fecha ISO `'YYYY-MM-DD'`. Tira si no tiene ese formato exacto o si
   * el día no existe (`'2026-02-30'`).
   *
   * @param what Nombre del dato para el mensaje de error ("La fecha de salida…").
   */
  static parse(iso: string, what: string): CalendarDate {
    const [, year, month, day] = (ISO_DATE_PATTERN.exec(iso) ?? []).map(Number);
    if (year === undefined || month === undefined || day === undefined) {
      throw new Error(
        `${what} tiene que ser una fecha 'AAAA-MM-DD' (llegó ${JSON.stringify(iso)}).`,
      );
    }
    const date = new CalendarDate(Date.UTC(year, month - 1, day));
    // why: `Date.UTC` no valida, desborda: el 30 de febrero lo pasa al 2 de marzo.
    if (date.iso !== iso) {
      throw new Error(`${what} no es un día que exista (llegó ${JSON.stringify(iso)}).`);
    }
    return date;
  }

  /** Año: `2026`. */
  get year(): number {
    return new Date(this.utcMidnight).getUTCFullYear();
  }

  /** Mes, de 1 (enero) a 12 (diciembre). */
  get month(): number {
    return new Date(this.utcMidnight).getUTCMonth() + 1;
  }

  /** Día del mes, de 1 a 31. */
  get day(): number {
    return new Date(this.utcMidnight).getUTCDate();
  }

  /** La fecha en ISO: `'2026-11-13'`. */
  get iso(): string {
    return new Date(this.utcMidnight).toISOString().slice(0, 'YYYY-MM-DD'.length);
  }

  /** La fecha `days` días después (o antes, con un número negativo). */
  addDays(days: number): CalendarDate {
    return new CalendarDate(this.utcMidnight + days * MS_PER_DAY);
  }

  /** Negativo si esta fecha es anterior a `other`, 0 si es la misma, positivo si es posterior. */
  compare(other: CalendarDate): number {
    return this.utcMidnight - other.utcMidnight;
  }

  /** Mismo mes del mismo año. */
  isSameMonth(other: CalendarDate): boolean {
    return this.year === other.year && this.month === other.month;
  }

  /** Clave del mes, ordenable como texto: `'2026-11'`. */
  monthKey(): string {
    return this.iso.slice(0, 'YYYY-MM'.length);
  }

  /** `"13 de noviembre"`, o `"13 de noviembre de 2026"` con `withYear`. */
  dayMonthLabel(withYear = false): string {
    return (withYear ? DAY_MONTH_YEAR : DAY_MONTH).format(this.utcMidnight);
  }

  /** Mes abreviado, en minúscula y sin punto: `"nov"`, `"sept"`. */
  shortMonthLabel(): string {
    return SHORT_MONTH.format(this.utcMidnight);
  }

  /** Mes y año, con mayúscula inicial: `"Noviembre 2026"`. */
  monthYearLabel(): string {
    const month = LONG_MONTH.format(this.utcMidnight);
    return `${month.charAt(0).toLocaleUpperCase(LOCALE)}${month.slice(1)} ${this.year}`;
  }

  /**
   * Rango desde esta fecha hasta `end` (inclusive), con el mínimo de palabras:
   * - mismo día: `"13 de noviembre"`;
   * - mismo mes: `"13 al 16 de noviembre"`;
   * - mismo año: `"28 de noviembre al 1 de diciembre"`;
   * - distinto año: `"30 de diciembre de 2026 al 2 de enero de 2027"`.
   *
   * Tira si `end` es anterior: un rango al revés es un bug de quien lo arma.
   */
  rangeLabelTo(end: CalendarDate): string {
    const order = this.compare(end);
    if (order > 0) {
      throw new Error(`El rango de fechas termina (${end.iso}) antes de empezar (${this.iso}).`);
    }
    if (order === 0) return this.dayMonthLabel();
    if (this.isSameMonth(end)) return `${this.day} al ${end.dayMonthLabel()}`;
    const withYear = this.year !== end.year;
    return `${this.dayMonthLabel(withYear)} al ${end.dayMonthLabel(withYear)}`;
  }
}
