/**
 * Color al que pasa el fondo de la página en el cierre: el `data-bg` de la
 * sección 13 (`dc.html:361`).
 *
 * Lo marcan la sección y el footer con `backgroundShift()`. En el diseño el
 * footer estaba adentro de la sección y la cubría una sola marca; acá el
 * footer va fuera del `<main>`, así que lleva la suya para que el fondo siga
 * verde hasta el final de la página. Es un `var(--…)` porque el motor lo
 * escribe tal cual como `background-color` del root.
 */
export const CLOSING_BACKGROUND = 'var(--color-accent-2-900)';
