/**
 * Recorta un valor a [0, 1]. Es el `clamp` del motor original (`dc.html:403`):
 * todos los progresos del motor (entrada de un reveal, avance de una sección
 * horizontal, relleno del timeline) viven en ese rango.
 *
 * Igual que el original, `NaN` sigue siendo `NaN`: no se "arregla" acá un
 * elemento sin alto, se deja que el CSS descarte el valor inválido.
 */
export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Recorta un valor a [min, max] (la velocidad del scroll, por ejemplo). */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
