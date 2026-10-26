'use server';

import { randomUUID } from 'node:crypto';

import { photoSchema } from '@/content/records/schema';
import { requireAdmin } from '@/server/auth/session';
import { MAX_PHOTO_BYTES, PHOTO_TYPES, sniffPhotoType } from '@/server/photos/imageFile';
import { getPhotoStorage } from '@/server/photos/photoStorage';

/** Lo que devuelve la subida: la foto lista para guardar (sin alt ni encuadre), o el error. */
export type UploadPhotoResult =
  | { readonly ok: true; readonly src: string; readonly width: number; readonly height: number }
  | { readonly ok: false; readonly message: string };

/** Un entero positivo de un campo del formulario. */
function dimension(formData: FormData, name: string): number {
  const value = Number(formData.get(name));
  return Number.isInteger(value) && value > 0 ? value : 0;
}

/**
 * Sube una foto desde el panel. El navegador ya la achicó y la mandó como
 * JPG o WebP con sus medidas (`width`, `height`); acá se revisa que sea una
 * foto de verdad (por su contenido, no por el nombre) y que no pase de
 * `MAX_PHOTO_BYTES`, y se guarda con un nombre nuevo (un UUID): nunca pisa
 * una foto que ya usa el sitio.
 *
 * Solo sube el archivo: la foto pasa a usarse recién cuando se guarda el
 * viaje.
 */
export async function uploadPhoto(formData: FormData): Promise<UploadPhotoResult> {
  await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'No llegó ninguna foto.' };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false, message: 'La foto pesa demasiado (máximo 4 MB ya achicada).' };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffPhotoType(bytes);
  if (!type) return { ok: false, message: 'El archivo no es una foto JPG, PNG o WebP.' };

  const width = dimension(formData, 'width');
  const height = dimension(formData, 'height');
  try {
    const src = await getPhotoStorage().save(`${randomUUID()}.${PHOTO_TYPES[type]}`, bytes, type);
    const photo = photoSchema.safeParse({ src, width, height, alt: '' });
    if (!photo.success) return { ok: false, message: 'La foto subida no tiene medidas válidas.' };
    return { ok: true, src, width, height };
  } catch (error) {
    console.error('[panel] No se pudo subir la foto.', error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'No se pudo subir la foto.',
    };
  }
}
