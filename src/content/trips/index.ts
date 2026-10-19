import { isTripSlug, type TripSlug } from '@/domain';

import { cajonDelAzulDetail } from './cajon-del-azul';
import { calleStepanekDetail } from './calle-stepanek';
import { lagoLologLagunaVerdeDetail } from './lago-lolog-laguna-verde';
import { lagunaNegraDetail } from './laguna-negra';
import type { TripDetailContent } from './types';

/**
 * El contenido de la página de cada viaje (`/viajes/<slug>`), por slug.
 *
 * Es un `Record` sobre `TripSlug`: si el catálogo suma un viaje, TypeScript
 * obliga a escribir su página acá antes de compilar (no puede quedar un viaje
 * con card en el carrusel y sin página).
 */
export const tripDetails: Readonly<Record<TripSlug, TripDetailContent>> = {
  'calle-stepanek': calleStepanekDetail,
  'lago-lolog-laguna-verde': lagoLologLagunaVerdeDetail,
  'laguna-negra': lagunaNegraDetail,
  'cajon-del-azul': cajonDelAzulDetail,
};

/**
 * El contenido de la página de un viaje a partir del segmento de la URL, o
 * `undefined` si el slug no es de ningún viaje (la página responde 404).
 */
export function findTripDetail(slug: string): TripDetailContent | undefined {
  return isTripSlug(slug) ? tripDetails[slug] : undefined;
}

export type * from './types';
