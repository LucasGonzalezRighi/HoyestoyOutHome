import { tripCatalog } from '@/content/catalog/trips';

import { upcomingTripDetail } from './common';
import type { TripDetailContent } from './types';

/**
 * Página de Cajón del Azul y Hielo Azul. Todavía no tiene itinerario: muestra
 * lo del catálogo y "Itinerario próximamente" (ver `upcomingTripDetail`).
 * Cuando el cliente pase el programa, se escribe acá como `calle-stepanek.ts`.
 */
export const cajonDelAzulDetail: TripDetailContent = upcomingTripDetail(
  tripCatalog.get('cajon-del-azul'),
);
