import { CalendarDate } from '../shared/CalendarDate';
import type { Trip } from '../trips/Trip';

/** Datos para crear una `Departure`. */
export type DepartureParams = {
  /** El viaje que sale. Las fechas de fin salen de su duración. */
  trip: Trip;
  /** Día de salida, ISO sin hora ni zona horaria: `'2026-11-13'`. */
  startsOn: string;
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
 * prerenderiza y en el navegador de cualquier huso. El fin no se carga: sale
 * de la duración del viaje, contando el día de salida (4 días desde el 13
 * terminan el 16), así una salida no puede contradecir a su viaje.
 *
 * Identidad: el viaje y el día de salida (`id`). Dos salidas del mismo viaje
 * el mismo día son un duplicado (lo controla `DepartureSchedule`).
 */
export class Departure {
  private readonly props: Readonly<{ trip: Trip; start: CalendarDate; end: CalendarDate }>;

  constructor({ trip, startsOn }: DepartureParams) {
    const start = CalendarDate.parse(startsOn, `La fecha de salida de "${trip.slug}"`);
    const { days } = trip.duration;
    if (days < 1) {
      throw new Error(
        `El viaje "${trip.slug}" dura ${days} días: una salida necesita al menos uno para tener fecha de fin.`,
      );
    }
    this.props = Object.freeze({ trip, start, end: start.addDays(days - 1) });
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
