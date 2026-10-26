/**
 * Qué fotos acepta el panel y cómo se reconocen. El navegador las achica
 * antes de subirlas (`features/admin` › `resizePhoto`), así que llegan livianas;
 * igual el servidor revisa el tipo por su contenido, no por lo que dice el
 * navegador.
 */

/** Formatos aceptados, con su extensión. */
export const PHOTO_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

/** Un formato aceptado. */
export type PhotoContentType = keyof typeof PHOTO_TYPES;

/**
 * Peso máximo de una foto ya achicada: entra con margen en el límite de 4,5 MB
 * por pedido de las funciones de Vercel (y en `serverActions.bodySizeLimit`).
 */
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

/** Si los bytes empiezan con la firma de un JPG, un PNG o un WebP, cuál es. */
export function sniffPhotoType(bytes: Uint8Array): PhotoContentType | undefined {
  const starts = (...signature: number[]) => signature.every((byte, i) => bytes[i] === byte);
  if (starts(0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  return undefined;
}
