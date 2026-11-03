import { CalendarDate } from '../shared/CalendarDate';
import type { Trip } from '../trips/Trip';
import { TripDuration } from '../trips/TripDuration';

/** Milisegundos de un día: las fechas de calendario se comparan a medianoche UTC. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Datos para crear una `Departure`. */
export type DepartureParams = {
  /** El viaje que sale. Si no se carga el día de regreso, sale de su duración. */
  trip: Trip;
  /** Día de salida, ISO sin hora ni zona horaria: `'2026-11-13'`. */
  startsOn: string;
  /**
   * Día de regreso, inclusive, si no es el que da la duración del viaje (una
   * salida que se alarga o se acorta). No puede ser antes de la salida.
   */
  endsOn?: string;
  /** La fecha todavía no está confirmada: el sitio la marca "A confirmar". */
  toConfirm?: boolean;
};

/**
 * La fecha de salida partida para un marcador de calendario: `{ day: '13', month: 'nov' }`.
 * Es un objeto plano, así que puede cruzar a un Client Component.
 */
export type DateMarker = {
  /** Día del mes, sin cero adelante: `"13"`, `"5"`. */
  readonly day: string;
  /** Mes abreviado, en minúscula y sin punto: `"nov"`. */
  readonly month: string;
};

/**
 * Una salida programada de un viaje: el ítem del calendario del home.
 *
 * Las fechas son de calendario, sin hora ni zona horaria, y se calculan y
 * formatean en UTC: la salida del 13 de noviembre dice "13" en el servidor que
 * prerenderiza y en el navegador de cualquier huso. El fin, si no se carga a
 * mano, sale de la duración del viaje contando el día de salida (4 días desde
 * el 13 terminan el 16). Una salida puede estar "a confirmar": tiene fecha
 * (para ordenarla y ubicarla en su mes) pero todavía no es definitiva.
 *
 * Identidad: el viaje y el día de salida (`id`). Dos salidas del mismo viaje
 * el mismo día son un duplicado (lo controla `DepartureSchedule`).
 */
export class Departure {
  private readonly props: Readonly<{
    trip: Trip;
    start: CalendarDate;
    end: CalendarDate;
    toConfirm: boolean;
  }>;

  constructor({ trip, startsOn, endsOn, toConfirm = false }: DepartureParams) {
    const start = CalendarDate.parse(startsOn, `La fecha de salida de "${trip.slug}"`);
    const { days } = trip.duration;
    if (days < 1) {
      throw new Error(
        `El viaje "${trip.slug}" dura ${days} días: una salida necesita al menos uno para tener fecha de fin.`,
      );
    }
    const end =
      endsOn === undefined
        ? start.addDays(days - 1)
        : CalendarDate.parse(endsOn, `La fecha de regreso de "${trip.slug}"`);
    if (end.compare(start) < 0) {
      throw new Error(
        `La salida de "${trip.slug}" del ${start.iso} vuelve antes de salir (${end.iso}).`,
      );
    }
    this.props = Object.freeze({ trip, start, end, toConfirm });
  }

  get trip(): Trip {
    return this.props.trip;
  }

  /** Día de salida en ISO: `'2026-11-13'` (sirve tal cual para `<time dateTime>`). */
  get startsOn(): string {
    return this.props.start.iso;
  }

  /** Último día del viaje en ISO, inclusive: `'2026-11-16'` para 4 días desde el 13. */
  get endsOn(): string {
    return this.props.end.iso;
  }

  /** La fecha todavía no está confirmada ("A confirmar"). */
  get toConfirm(): boolean {
    return this.props.toConfirm;
  }

  /**
   * Cuánto dura esta salida. Es la del viaje, salvo que la vuelta se haya
   * cargado a mano: ahí cuentan los días entre salida y vuelta (inclusive), y
   * las noches se corren lo mismo que los días (una salida de Calle & Stepanek
   * del 13 al 18 son 6 días y 5 noches). Así la duración nunca contradice el
   * rango de fechas que se muestra al lado.
   */
  get duration(): TripDuration {
    const { trip, start, end } = this.props;
    const days = Math.round(end.compare(start) / MS_PER_DAY) + 1;
    const base = trip.duration;
    if (days === base.days) return base;
    const nights = Math.min(days, Math.max(0, base.nights + (days - base.days)));
    return new TripDuration(days, nights);
  }

  /** Identidad estable, apta para `key` de React o un `id` de HTML: `'calle-stepanek-2026-11-13'`. */
  get id(): string {
    return `${this.props.trip.slug}-${this.startsOn}`;
  }

  /**
   * Del día de salida al de regreso, inclusive: `"13 al 16 de noviembre"`,
   * `"28 de noviembre al 1 de diciembre"`, y con año solo si cruza de año
   * (`"30 de diciembre de 2026 al 2 de enero de 2027"`). Un viaje de un día:
   * `"13 de noviembre"`.
   */
  rangeLabel(): string {
    return this.props.start.rangeLabelTo(this.props.end);
  }

  /**
   * El día de salida con el mes entero, sin año: `"13 de noviembre"`. Es lo
   * que lee el lector de pantalla en lugar del marcador abreviado (`13 nov`).
   * El año no hace falta: el calendario agrupa las salidas bajo "Noviembre 2026".
   */
  startLabel(): string {
    return this.props.start.dayMonthLabel();
  }

  /** El día de salida para el marcador de la línea de tiempo: `{ day: '13', month: 'nov' }`. */
  marker(): DateMarker {
    const { start } = this.props;
    return { day: String(start.day), month: start.shortMonthLabel() };
  }

  /** Clave del mes de salida, ordenable como texto: `'2026-11'`. */
  monthKey(): string {
    return this.props.start.monthKey();
  }

  /** Mes y año de salida: `"Noviembre 2026"`. */
  monthLabel(): string {
    return this.props.start.monthYearLabel();
  }

  /** Orden cronológico por día de salida: negativo si esta sale antes que `other`. */
  compareTo(other: Departure): number {
    return this.props.start.compare(other.props.start);
  }
}
