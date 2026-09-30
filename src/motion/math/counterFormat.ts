import { SITE } from '@/constants/site';

import type { CounterFormat } from '../attributes';

/**
 * Lee el formato de un contador desde su atributo. Cualquier valor que no sea
 * `thousands` es `plain`, como en el original (`dc.html:602`: solo `'k'` cambia algo).
 */
export function parseCounterFormat(raw: string | null): CounterFormat {
  return raw === 'thousands' ? 'thousands' : 'plain';
}

/**
 * Texto de un contador a mitad de camino (`fmt()` del motor original, `dc.html:600-603`).
 *
 * Redondea al entero (los contadores no muestran decimales mientras suben) y
 * formatea con el separador de miles de es-AR. `thousands` agrega `.000` fijo:
 * así `$690.000` cuenta de a miles y no pasa por `$689.347`.
 *
 * @param target   Valor final (el del atributo `data-count`).
 * @param progress 0 = arranque, 1 = valor final.
 *
 * @example formatCounter(690, 1, 'thousands') // "690.000"
 * @example formatCounter(1900, 1, 'plain')    // "1.900"
 */
export function formatCounter(target: number, progress: number, format: CounterFormat): string {
  const value = Math.round(target * progress);
  const formatted = value.toLocaleString(SITE.locale);
  return format === 'thousands' ? `${formatted}.000` : formatted;
}
