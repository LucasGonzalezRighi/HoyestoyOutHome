import { Photo } from '@/domain';

import type { PhotoRecord } from './schema';

/**
 * Pasa una foto guardada (datos planos) a la clase del dominio. El encuadre
 * que no se cargó queda en el neutro de `Photo` (`'center'`).
 */
export function toPhoto(record: PhotoRecord): Photo {
  return new Photo(record);
}

/**
 * Pasa una foto del dominio a datos planos para guardarla. El encuadre neutro
 * no se guarda: así un dato vacío y uno "center" son lo mismo.
 */
export function toPhotoRecord(photo: Photo): PhotoRecord {
  const { src, width, height, alt, position } = photo;
  return {
    src,
    width,
    height,
    alt,
    ...(position === Photo.DEFAULT_POSITION ? {} : { position }),
  };
}
