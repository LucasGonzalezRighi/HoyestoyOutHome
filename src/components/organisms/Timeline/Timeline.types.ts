/**
 * Nivel del título de un ítem o de un grupo de la línea de tiempo.
 *
 * Es obligatorio y lo decide quien la usa, porque depende de dónde cuelga:
 * en la página de un viaje los días son `h3` (debajo del `h2` "Cronograma");
 * en el calendario del home los meses son `h3` y las salidas `h4` (debajo del
 * `h2` de la sección). Así el índice de encabezados no salta niveles.
 */
export type TimelineHeadingLevel = 3 | 4 | 5;

/**
 * Marcador con más de un dato: una fecha corta de dos renglones ("13" / "nov")
 * o un número con un texto más claro para el lector de pantalla.
 */
export type TimelineMarkerDetail = {
  /** Lo que se lee grande, en la tipografía de títulos: `"13"`, `"1"`. Corto (hasta 3 caracteres). */
  value: string;
  /** Segundo renglón, chico: el mes abreviado (`"nov"`). Sin él, el marcador es de un renglón. */
  caption?: string;
  /**
   * Lo que lee el lector de pantalla en lugar de lo visible, cuando lo visible
   * es una abreviatura: `"13 de noviembre"`, `"Día 1"`. Sin él, se lee lo visible.
   */
  label?: string;
  /**
   * Fecha en formato ISO (`"2026-11-13"`). Si está, el marcador es un
   * `<time dateTime>`: la fecha queda legible para máquinas (buscadores,
   * calendarios del navegador).
   */
  dateTime?: string;
};

/**
 * Lo que va dentro del círculo de un ítem: un texto corto (`"1"`, el número de
 * día del cronograma) o un `TimelineMarkerDetail` (una fecha de dos renglones).
 */
export type TimelineMarker = string | TimelineMarkerDetail;
