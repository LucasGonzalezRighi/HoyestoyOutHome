/**
 * Curva cúbica de entrada y salida (`ease` del motor original, `dc.html:404`).
 *
 * Es la única curva del motor: los reveals, los contadores y el zoom de intro
 * la aplican sobre un progreso lineal 0→1 atado al scroll o a la intro. Arranca
 * y termina suave, así un elemento no "frena en seco" al llegar a su lugar.
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
