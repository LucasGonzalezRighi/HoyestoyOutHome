import type { DotTone } from '@/components/atoms/Dot';
import type { TripChecklistContent } from '@/content/trips';
import type { ServiceGroupKind } from '@/domain';

/** Un grupo de una card de la checklist: título, color de viñeta e ítems. */
export type ChecklistGroupData = {
  /** `key` del grupo: su tipo (`'notIncluded'`). */
  readonly kind: ServiceGroupKind;
  /** Título del grupo ("¿Qué necesito? · Ropa"). */
  readonly title: string;
  /** Color de las viñetas de la lista. */
  readonly dotTone: DotTone;
  /** Los ítems de la checklist, en orden. */
  readonly items: readonly string[];
};

/** Una card de la grilla: uno o más grupos, de arriba a abajo. */
export type ChecklistPanelData = {
  /** `key` de la card: los grupos que lleva (`'transfers-notIncluded'`). */
  readonly id: string;
  /** Sus grupos, en orden. */
  readonly groups: readonly ChecklistGroupData[];
};

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
 * Arma las cards de "¿Qué incluye y qué necesito?": cada card toma sus grupos
 * de la checklist del viaje, en el orden que fija `content.panels`, con el
 * título del contenido y el color de viñeta del feature.
 *
 * Los ítems se leen con `checklist[kind]`: `ServiceChecklist` expone un getter
 * por cada `ServiceGroupKind`, con el mismo nombre, así que el acceso es total
 * y tipado (no hay un "no encontrado" que manejar).
 */
export function checklistPanels({
  checklist,
  groupTitles,
  panels,
}: TripChecklistContent): readonly ChecklistPanelData[] {
  return panels.map((kinds) => ({
    id: kinds.join('-'),
    groups: kinds.map((kind) => ({
      kind,
      title: groupTitles[kind],
      dotTone: GROUP_DOT_TONES[kind],
      items: checklist[kind],
    })),
  }));
}
