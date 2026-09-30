import type { DotTone } from '@/components/atoms/Dot';
import type { ServicesContent, ServicesTabContent } from '@/content/sections/services';
import type { ServiceGroupKind } from '@/domain';

import type { ServiceTabData, ServiceTabList } from './types';

/**
 * Color de la viñeta de cada grupo. Es presentación, por eso vive en el
 * feature y no en el contenido. En el diseño: `dotB` (verde musgo) para lo que
 * pone la empresa, `dotX` (neutro) para lo que no incluye y `dotA` (dorado)
 * para lo que lleva el viajero (`dc.html:628` y `702-707`).
 */
const GROUP_DOT_TONES = {
  included: 'accent-2',
  transfers: 'accent-2',
  notIncluded: 'neutral',
  clothing: 'accent',
  gear: 'accent',
} as const satisfies Record<ServiceGroupKind, DotTone>;

/**
 * Convierte el contenido de "Servicios y equipo" (instancias del dominio) en
 * los datos planos que recibe `ServiceTabs`, el Client Component de las
 * pestañas. Se llama en el Server Component: las clases no cruzan la frontera.
 */
export function toServiceTabs(content: ServicesContent): ServiceTabList {
  const [first, ...rest] = content.tabs;
  return [toServiceTab(first, content), ...rest.map((tab) => toServiceTab(tab, content))];
}

/**
 * Una pestaña: cada panel toma sus grupos de la checklist del viaje, en el
 * orden que fija `content.panels`.
 *
 * Los ítems se leen con `checklist[kind]`: `ServiceChecklist` expone un getter
 * por cada `ServiceGroupKind`, con el mismo nombre, así que el acceso es total
 * y tipado (a diferencia de buscar en `groups()`, que obligaría a manejar un
 * "no encontrado" que no puede pasar). Son arrays congelados: datos planos.
 *
 * El `id` del panel no depende del viaje (la card se conserva entre pestañas)
 * y el del grupo sí (la lista se remonta): ver `ServiceTabs`.
 */
function toServiceTab(
  { trip, checklist }: ServicesTabContent,
  { groupTitles, panels }: ServicesContent,
): ServiceTabData {
  return {
    slug: trip.slug,
    label: trip.shortName,
    panels: panels.map((kinds) => ({
      id: kinds.join('-'),
      groups: kinds.map((kind) => ({
        id: `${trip.slug}-${kind}`,
        title: groupTitles[kind],
        dotTone: GROUP_DOT_TONES[kind],
        items: checklist[kind],
      })),
    })),
  };
}
