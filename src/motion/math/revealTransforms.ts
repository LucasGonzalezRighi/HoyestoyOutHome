import type { RevealVariant } from '../attributes';

import { easeInOutCubic } from './easing';
import { introRevealProgress } from './revealProgress';

/**
 * Tabla de coreografías de los reveals: qué pose toma un elemento en cada
 * punto de su entrada y su salida.
 *
 * Es el `switch (type)` de `dc.html:581-593` con los **números exactos** del
 * diseño. Es el único lugar del motor con números inline: cada fila es una
 * coreografía completa y se lee mejor entera que partida en constantes.
 *
 * Cambios respecto del original: la variante `rot` se llama `rotate`, y el
 * `case 'word'` del switch no se portó porque era inalcanzable (las palabras
 * del hero salen antes del switch, ver `wordRevealTransform`).
 */

/** Variantes que maneja el scroll (todas menos `word`, que maneja la intro). */
export type ScrollRevealVariant = Exclude<RevealVariant, 'word'>;

/**
 * Punto de la animación. Los nombres del original entre paréntesis.
 *
 * - `entered` (`ea`): entrada con curva, 0 = abajo y oculto, 1 = en su lugar.
 * - `staying` (`eb`): salida con curva, 1 = en pantalla, 0 = ya se fue por arriba.
 * - `pending` (`inv` = 1 − ea): cuánto le falta entrar.
 * - `leaving` (`out` = 1 − eb): cuánto ya salió.
 * - `intensity` (`k`): el nivel de animaciones.
 */
export type RevealPose = {
  readonly entered: number;
  readonly staying: number;
  readonly pending: number;
  readonly leaving: number;
  readonly intensity: number;
};

/** Lo que devuelve cada coreografía, antes de redondear. */
type ChoreographyFrame = {
  readonly transform: string;
  /** Si falta, la opacidad acompaña a la entrada y a la salida: `min(ea, eb)`. */
  readonly opacity?: number;
  readonly clipPath?: string;
};

type Choreography = (pose: RevealPose) => ChoreographyFrame;

/** Estilos listos para escribir en el elemento. */
export type RevealStyles = {
  readonly transform: string;
  /** Con tres decimales, como `op.toFixed(3)` del original. */
  readonly opacity: string;
  /** Solo `clip` recorta. */
  readonly clipPath?: string;
};

const CHOREOGRAPHIES: Record<ScrollRevealVariant, Choreography> = {
  /** Sube 70px (× k) y sale subiendo 50px. El `default` del original. */
  up: ({ pending, leaving, intensity: k }) => ({
    transform: `translate3d(0, ${pending * 70 * k - leaving * 50 * k}px, 0)`,
  }),
  /** Entra 90px desde la izquierda con 3° de giro. */
  left: ({ pending, leaving, intensity: k }) => ({
    transform: `translate3d(${-pending * 90 * k}px, ${-leaving * 50 * k}px, 0) rotate(${-pending * 3 * k}deg)`,
  }),
  /** Espejo de `left`. */
  right: ({ pending, leaving, intensity: k }) => ({
    transform: `translate3d(${pending * 90 * k}px, ${-leaving * 50 * k}px, 0) rotate(${pending * 3 * k}deg)`,
  }),
  /** Sube 120px girando 9° y creciendo desde el 88% (`rot` en el original). */
  rotate: ({ pending, leaving, intensity: k }) => ({
    transform: `translate3d(0, ${pending * 120 * k - leaving * 60 * k}px, 0) rotate(${-pending * 9 * k}deg) scale(${1 - pending * 0.12})`,
  }),
  /** Rueda 180px desde la izquierda: 300° de giro y crece desde el 60%. */
  roll: ({ pending, intensity: k }) => ({
    transform: `translate3d(${-pending * 180 * k}px, 0, 0) rotate(${-pending * 300 * k}deg) scale(${1 - pending * 0.4})`,
  }),
  /** Se despliega en X con perspectiva de 900px; el giro topea en k = 1.2. */
  flip: ({ pending, leaving, intensity: k }) => ({
    transform: `perspective(900px) rotateX(${pending * 70 * Math.min(k, 1.2)}deg) translate3d(0, ${pending * 60 - leaving * 40}px, 0)`,
  }),
  /**
   * Se destapa de abajo hacia arriba. Opacidad fija en 1: el recorte ya oculta.
   * `round 32px` es el radio de la foto que recorta (`dc.html:144`).
   */
  clip: ({ pending }) => ({
    clipPath: `inset(${(pending * 100).toFixed(2)}% 0 0 0 round 32px)`,
    transform: `scale(${1 + pending * 0.15})`,
    opacity: 1,
  }),
  /** Crece desde el 55% y sale subiendo 60px. No escala con k: es una frase, no un bloque. */
  zoom: ({ entered, leaving }) => ({
    transform: `scale(${0.55 + 0.45 * entered}) translate3d(0, ${-leaving * 60}px, 0)`,
  }),
  /** Sube 40px creciendo desde el 75% (el achique topea en k = 1.4). */
  scale: ({ pending, leaving, intensity: k }) => ({
    transform: `translate3d(0, ${pending * 40 * k - leaving * 50 * k}px, 0) scale(${1 - pending * 0.25 * Math.min(k, 1.4)})`,
  }),
  /** Banda que sube, se expande y nunca baja del 30% de opacidad (fotos grandes, precio). */
  expand: ({ entered, staying, pending, leaving, intensity: k }) => ({
    transform: `translate3d(0, ${pending * 120 * k - leaving * 40 * k}px, 0) scale(${1 - pending * 0.22 * Math.min(k, 1.3) - leaving * 0.06})`,
    opacity: 0.3 + 0.7 * Math.min(entered, staying),
  }),
};

function isScrollRevealVariant(value: string | null): value is ScrollRevealVariant {
  return value !== null && Object.hasOwn(CHOREOGRAPHIES, value);
}

/**
 * Corta (no redondea) los números con más de tres decimales de un valor CSS:
 * `12.3456789px` → `12.345px`. Es el `replace(/(\d+\.\d{3})\d+/g, '$1')` del
 * original (`dc.html:594`): con menos dígitos el string cambia menos seguido y
 * la caché de estilos (`StyleWriter`) se saltea más escrituras.
 */
export function truncateDecimals(css: string): string {
  return css.replace(/(\d+\.\d{3})\d+/g, '$1');
}

/**
 * Estilos de un reveal de scroll en un punto de su animación.
 *
 * Una variante desconocida (o `null`) se comporta como `up`, igual que el
 * `default` del switch original.
 *
 * @param variant   Valor del atributo `data-reveal`.
 * @param entered   Entrada con curva (`ea`).
 * @param staying   Salida con curva (`eb`).
 * @param intensity Nivel de animaciones (`k`).
 */
export function revealStyles(
  variant: string | null,
  entered: number,
  staying: number,
  intensity: number,
): RevealStyles {
  const choreography = CHOREOGRAPHIES[isScrollRevealVariant(variant) ? variant : 'up'];
  const frame = choreography({
    entered,
    staying,
    pending: 1 - entered,
    leaving: 1 - staying,
    intensity,
  });
  const opacity = frame.opacity ?? Math.min(entered, staying);
  return {
    transform: truncateDecimals(frame.transform),
    opacity: opacity.toFixed(3),
    clipPath: frame.clipPath,
  };
}

/**
 * Pose de una palabra del titular del hero (`dc.html:575`): sube desde detrás
 * de su máscara (110%) enderezándose (8°), palabra por palabra con la intro.
 * No toca la opacidad: la máscara del marcado ya la oculta.
 *
 * @param intro Progreso de la intro, 0–1.
 * @param delay Posición de la palabra en el titular.
 */
export function wordRevealTransform(intro: number, delay: number): string {
  const shown = easeInOutCubic(introRevealProgress(intro, delay));
  return `translate3d(0, ${((1 - shown) * 110).toFixed(2)}%, 0) rotate(${((1 - shown) * 8).toFixed(2)}deg)`;
}
