/**
 * El `sizes` de la foto de un panel del abanico.
 *
 * La foto llena un marco fijo (el panel abierto) con `object-fit: cover`, así
 * que el ancho que hace falta no es el del marco sino el de la foto ya
 * escalada para cubrirlo: una apaisada cubre el alto y sobra por los costados.
 * Con el ancho del marco a secas, `next/image` elegiría para la foto de Lago
 * Lolog (16:9) un archivo de la mitad del ancho que se termina mostrando.
 *
 * Las medidas repiten las de `TripsFan.module.css`: el CSS no se puede leer
 * desde un Server Component. Si cambian allá, cambian acá.
 */
const FRAME = {
  /** Ancho del panel abierto con el contenedor al máximo (`--layout-max`) y cuatro viajes: 544px. */
  desktopWidth: 544,
  /** Tope de `--fan-height`. */
  desktopHeight: 600,
  /** Alto del panel abierto en el celular (`--fan-open-height`). */
  mobileHeight: 380,
  /** El zoom de la foto del panel abierto (`scale` de `.media`). */
  zoom: 1.045,
  /** El corte de ancho del diseño: hasta acá, los paneles van apilados. */
  mobileBreakpoint: 820,
} as const;

/** Ancho, en px enteros, de una foto de proporción `aspectRatio` que cubre un marco de `width` × `height`. */
function coverWidth(aspectRatio: number, width: number, height: number): number {
  return Math.ceil(Math.max(width, height * aspectRatio) * FRAME.zoom);
}

/**
 * `sizes` de `next/image` para la foto de un panel.
 *
 * En el celular el marco ocupa el ancho de la pantalla (menos el margen) y
 * mide 380px de alto: una foto vertical necesita el ancho de la pantalla, y
 * una apaisada, el que cubre los 380px, que en un teléfono es más que la
 * pantalla. Va como dos condiciones y no con `max()`, que no todos los
 * navegadores aceptan en `sizes`.
 *
 * @param aspectRatio Ancho / alto del archivo (`photo.width / photo.height`).
 */
export function panelPhotoSizes(aspectRatio: number): string {
  const mobile = coverWidth(aspectRatio, 0, FRAME.mobileHeight);
  const desktop = coverWidth(aspectRatio, FRAME.desktopWidth, FRAME.desktopHeight);
  return [
    `(max-width: ${Math.min(mobile, FRAME.mobileBreakpoint)}px) ${mobile}px`,
    `(max-width: ${FRAME.mobileBreakpoint}px) 100vw`,
    `${desktop}px`,
  ].join(', ');
}
