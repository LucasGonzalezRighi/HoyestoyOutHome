/**
 * Achica una foto en el navegador antes de subirla: el lado más largo queda
 * en `MAX_EDGE_PX` y se codifica en WebP (o JPG donde el navegador no sabe
 * codificar WebP, como Safari). Una foto de celular de 5 MB queda en unos
 * cientos de KB: sube rápido y entra en el límite de las funciones de Vercel.
 *
 * Devuelve también las medidas finales, que el sitio necesita para reservar
 * el lugar de la foto antes de que cargue.
 */

/** Lado más largo de la foto subida: alcanza para una portada a pantalla completa. */
export const MAX_EDGE_PX = 2400;

/** Calidad de compresión: sin pérdida visible en fotos de paisaje. */
const QUALITY = 0.86;

/** `canvas.toBlob` con promesa. */
function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/** La foto achicada, lista para subir. */
export type ResizedPhoto = { blob: Blob; width: number; height: number };

/**
 * @throws Si el navegador no puede leer el archivo (por ejemplo, un HEIC en
 *   Chrome): el panel avisa que se use JPG o PNG.
 */
export async function resizePhoto(file: File): Promise<ResizedPhoto> {
  // Respeta la orientación de la cámara (EXIF): la foto queda derecha.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('El navegador no puede procesar la foto.');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = await toBlob(canvas, 'image/webp');
  // Safari no codifica WebP: devuelve un PNG (pesadísimo). Ahí va JPG.
  const blob = webp?.type === 'image/webp' ? webp : await toBlob(canvas, 'image/jpeg');
  if (!blob) throw new Error('El navegador no pudo comprimir la foto.');
  return { blob, width, height };
}
