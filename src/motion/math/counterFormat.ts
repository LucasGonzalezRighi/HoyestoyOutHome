import { SITE } from '@/constants/site';

import type { CounterFormat } from '../attributes';

/**
 * Un solo formateador para todos los contadores, creado al cargar el módulo.
 *
 * `toLocaleString(locale)` arma un `Intl.NumberFormat` nuevo en cada llamada
 * (~8 µs en Chrome); reutilizado, formatear cuesta ~0,3 µs y da el mismo
 * texto. Con cinco contadores por frame de scroll, era la segunda función por
 * tiempo propio en el perfil.
 */
const NUMBER_FORMAT = new Intl.NumberFormat(SITE.locale);

/**
 * Lee el formato de un contador desde su atributo. Cualquier valor que no sea
 * `thousands` es `plain`, como en el original (`dc.html:602`: solo `'k'` cambia algo).
 */
export function parseCounterFormat(raw: string | null): CounterFormat {
  return raw === 'thousands' ? 'thousands' : 'plain';
}

/**
 * El entero que muestra un contador a mitad de camino (el `v` de `fmt()` del
 * motor original, `dc.html:601`).
 *
 * Redondea al entero: los contadores no muestran decimales mientras suben. Va
 * aparte del formateo para que `CounterEffect` compare enteros y solo formatee
 * cuando el número cambia.
 *
 * @param target   Valor final (el del atributo `data-count`).
 * @param progress 0 = arranque, 1 = valor final.
 *
 * @example counterValue(1900, 0.5) // 950
 */
export function counterValue(target: number, progress: number): number {
  return Math.round(target * progress);
}

/**
 * Texto de un contador para un entero ya redondeado (el formateo de `fmt()`
 * del motor original, `dc.html:602`).
 *
 * Usa el separador de miles de es-AR. `thousands` agrega `.000` fijo: así
 * `$690.000` cuenta de a miles y no pasa por `$689.347`.
 *
 * @param value  El entero que se muestra (ver `counterValue`).
 * @param format Formato del contador (`data-count-format`).
 *
 * @example formatCounterValue(690, 'thousands') // "690.000"
 * @example formatCounterValue(1900, 'plain')    // "1.900"
 */
export function formatCounterValue(value: number, format: CounterFormat): string {
  const formatted = NUMBER_FORMAT.format(value);
  return format === 'thousands' ? `${formatted}.000` : formatted;
}
