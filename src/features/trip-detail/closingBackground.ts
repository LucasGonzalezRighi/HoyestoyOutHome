/**
 * Color al que pasa el fondo de la página en el cierre de un viaje: el
 * `data-bg` de la sección 13 del diseño (`dc.html:361`), el mismo que el cierre
 * del home y el footer. Así el verde oscuro del cierre sigue sin corte en el
 * footer, que lleva su propia marca con este color.
 *
 * Es una copia del `CLOSING_BACKGROUND` de `features/contact`: un feature no
 * importa de otro. Es un `var(--…)` porque el motor lo escribe tal cual como
 * `background-color` del root.
 */
export const CLOSING_BACKGROUND = 'var(--color-accent-2-900)';
