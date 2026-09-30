import { clamp01 } from './clamp';

/**
 * Matemática de la sección con scroll horizontal fijado (`[data-hscroll]`,
 * `dc.html:533-540`): scroll vertical → desplazamiento horizontal del riel,
 * 1 a 1. La usan `HorizontalScrollEffect` para trasladar el riel y, al revés,
 * para llevar a la vista la card que recibe el foco del teclado.
 */

/**
 * Cuánto se traslada el riel de punta a punta: lo que mide de más respecto
 * del viewport (`dc.html:535`). Es también el alto extra de la sección.
 *
 * @param trackWidth    Ancho total del riel (`scrollWidth`).
 * @param viewportWidth Ancho del viewport.
 */
export function horizontalDistance(trackWidth: number, viewportWidth: number): number {
  return Math.max(0, trackWidth - viewportWidth);
}

/**
 * Avance 0→1 del riel (`dc.html:537`): lo que se scrolleó dentro de la
 * sección, en proporción a la distancia que recorre el riel.
 *
 * @param scrolled Px scrolleados desde que la sección tocó el borde de arriba
 *                 del viewport (el `-top` de su rect; negativo si todavía no llegó).
 * @param distance Lo que recorre el riel (`horizontalDistance`).
 */
export function horizontalProgress(scrolled: number, distance: number): number {
  return clamp01(scrolled / Math.max(1, distance));
}

/** Lo que hace falta saber para llevar un ítem del riel a la vista. */
export type HorizontalItemTarget = {
  /** Borde de arriba de la sección en coordenadas de la página (su `top` en el viewport + el scroll). */
  readonly sectionTop: number;
  /**
   * Cuánto está corrido el ítem respecto del primer hijo del riel, en px. Es
   * su posición en el riel menos el gutter (el padding con el que arranca el
   * riel), y no depende de la traslación actual: los dos se trasladan juntos.
   */
  readonly itemOffset: number;
  /** Lo que recorre el riel (`horizontalDistance`). */
  readonly distance: number;
};

/**
 * El inverso del efecto: el scroll vertical (de la página) que deja al ítem
 * donde arranca el riel, en el borde del gutter.
 *
 * Con la traslación del efecto (`-progreso × distancia`), el ítem queda en el
 * gutter cuando `progreso = itemOffset / distancia`; y el efecto calcula ese
 * progreso a partir de cuánto se scrolleó dentro de la sección, así que el
 * scroll buscado es `sectionTop + progreso × distancia`. Los ítems del final,
 * que nunca llegan al gutter, quedan con el riel al final de su recorrido
 * (progreso 1): es la pose en la que se ven.
 */
export function scrollTopToShowItem({
  sectionTop,
  itemOffset,
  distance,
}: HorizontalItemTarget): number {
  return sectionTop + horizontalProgress(itemOffset, distance) * distance;
}
