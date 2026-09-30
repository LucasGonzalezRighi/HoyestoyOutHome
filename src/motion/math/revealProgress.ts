import { REVEAL } from '@/design-system/tokens/motion';

import { clamp01 } from './clamp';

/**
 * Ventana de scroll de los reveals: cuándo empieza y termina cada tramo.
 * Son las fórmulas de `dc.html:573-578`, con el mismo orden de operaciones
 * (importa: con floats, `a * b * c` no siempre da lo mismo que `a * (b * c)`).
 *
 * Qué pose toma el elemento en cada punto de la ventana lo decide
 * `revealTransforms.ts`; acá solo se mide el avance.
 */

/** Lo mínimo que hace falta de un `DOMRect` para ubicar un reveal. */
export type VerticalBounds = { readonly top: number; readonly bottom: number };

/**
 * Progreso lineal de la entrada por abajo (0 = todavía abajo, 1 = en su lugar).
 *
 * @param top            Borde superior del elemento respecto del viewport.
 * @param viewportHeight Alto del viewport.
 * @param delay          Escalón de retraso (`reveal(…, { delay })`).
 * @param span           Porción del viewport que dura la entrada.
 */
export function scrollEntryProgress(
  top: number,
  viewportHeight: number,
  delay: number,
  span: number,
): number {
  return clamp01(
    (viewportHeight * REVEAL.entryLine - top - delay * viewportHeight * REVEAL.delayStep) /
      (viewportHeight * span),
  );
}

/**
 * Progreso lineal de la salida por arriba (1 = todavía visible, 0 = ya se fue).
 * Los reveals no son play-once: al volver a subir, el elemento vuelve a entrar.
 */
export function scrollExitProgress(bottom: number, viewportHeight: number): number {
  return clamp01(bottom / (viewportHeight * REVEAL.exitSpan));
}

/**
 * Progreso de un reveal manejado por la intro del telón en vez del scroll
 * (titular y bajada del hero). Corre más rápido que la intro y escalona por `delay`.
 */
export function introRevealProgress(intro: number, delay: number): number {
  return clamp01(intro * REVEAL.introSpeed - delay * REVEAL.introDelayStep);
}

/**
 * Si el elemento está lejos del viewport (más de 1,6 viewports abajo o 0,6
 * arriba). Un reveal lejano que ya fue posado una vez no se recalcula: su pose
 * no cambió y reescribirla solo gasta frames.
 */
export function isFarFromViewport(bounds: VerticalBounds, viewportHeight: number): boolean {
  return (
    bounds.top > viewportHeight * REVEAL.parkBelow ||
    bounds.bottom < -viewportHeight * REVEAL.parkAbove
  );
}
