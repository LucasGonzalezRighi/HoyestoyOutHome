import { clamp01 } from './clamp';

/**
 * El `top` del `position: sticky` de la sección fija de una cortina.
 *
 * Una sección más baja que la pantalla queda fija arriba (`0`). Una más alta
 * (el calendario en un teléfono) tiene que scrollear entera antes de fijarse:
 * se fija cuando su borde de abajo toca el de la pantalla, o sea en
 * `alto de pantalla − alto de la sección` (negativo). CSS no puede calcularlo
 * (un `%` en `top` es del contenedor, no del elemento), por eso lo mide el motor.
 */
export function coverStickyTop(viewportHeight: number, pinnedHeight: number): number {
  return Math.min(0, viewportHeight - pinnedHeight);
}

/**
 * Cuánto tapó la sección que sube: 0 con su borde de arriba en el pie de la
 * pantalla, 1 cuando llegó arriba de todo.
 */
export function coverProgress(sheetTop: number, viewportHeight: number): number {
  return clamp01(1 - sheetTop / Math.max(1, viewportHeight));
}

/** Cuán sólido está el nav: 0 arriba de todo, 1 después de `distance` px de scroll. */
export function navSolidProgress(scrollY: number, distance: number): number {
  return clamp01(scrollY / Math.max(1, distance));
}
