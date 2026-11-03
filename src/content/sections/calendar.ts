import type { DepartureMonth, DepartureSchedule } from '@/content/catalog/departures';
import type { HomeTextsRecord } from '@/content/records/schema';
import { TO_CONFIRM_LABEL } from '@/content/trips/common';
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
  /** "A confirmar": la etiqueta de las salidas cuya fecha no es definitiva. */
  readonly toConfirmLabel: string;
  /**
   * Aviso visible arriba del calendario (hoy, que las fechas son de ejemplo).
   * Se edita desde el panel: vacío, no se muestra.
   */
  readonly placeholderNote?: string;
  /** Las salidas agrupadas por mes, en orden cronológico (`schedule.byMonth()`). */
  readonly months: readonly DepartureMonth[];
};

/**
 * Contenido de "Calendario". Título, bajada y aviso se editan desde el panel;
 * las salidas, en la pantalla "Salidas" del panel (las que ya pasaron no se
 * muestran).
 */
export function calendarContent(
  schedule: DepartureSchedule,
  texts: HomeTextsRecord['calendar'],
): CalendarContent {
  return {
    eyebrow: 'Calendario',
    title: texts.title,
    lead: texts.lead,
    viewTripLabel: 'Ver viaje',
    toConfirmLabel: TO_CONFIRM_LABEL,
    ...(texts.note ? { placeholderNote: texts.note } : {}),
    months: schedule.byMonth(),
  };
}
