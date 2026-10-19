import { departureSchedule, type DepartureMonth } from '@/content/catalog/departures';
import type { SectionHeadingContent } from '@/content/types';

/**
 * Textos y salidas de "Calendario", la línea de tiempo de próximas salidas
 * del home (sección nueva, pedida por el cliente en octubre de 2026: no está
 * en el diseño): el encabezado centrado y, debajo, una tarjeta por salida
 * colgando de la marca de su mes.
 *
 * Las salidas son instancias del dominio (`Departure`), agrupadas por el mes
 * en que salen: la fecha, el rango y el viaje salen de ellas, no de este
 * archivo.
 */
export type CalendarContent = Required<SectionHeadingContent> & {
  /** Bajada debajo del título. */
  readonly lead: string;
  /**
   * Texto visible del botón de cada salida, que lleva a la página del viaje.
   * El componente le suma el nombre del viaje en texto oculto (§9.1 de
   * CLAUDE.md, "label in name").
   */
  readonly viewTripLabel: string;
  /**
   * **Temporal.** Aviso visible de que las fechas son de ejemplo. Cuando el
   * cliente pase las salidas reales (en `content/catalog/departures.ts`), se
   * borra este campo y el aviso deja de mostrarse.
   */
  readonly placeholderNote?: string;
  /** Las salidas agrupadas por mes, en orden cronológico (`departureSchedule.byMonth()`). */
  readonly months: readonly DepartureMonth[];
};

/** Contenido de "Calendario". */
export const calendarContent: CalendarContent = {
  eyebrow: 'Calendario',
  title: 'Próximas salidas',
  lead: 'Elegí la fecha que mejor te quede y reservá tu lugar.',
  viewTripLabel: 'Ver viaje',
  placeholderNote:
    '[completar] Fechas de ejemplo: reemplazar por las salidas reales en src/content/catalog/departures.ts.',
  months: departureSchedule.byMonth(),
};
