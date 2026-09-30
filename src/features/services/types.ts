import type { DotTone } from '@/components/atoms/Dot';
import type { TripSlug } from '@/domain';

/*
 * Datos planos de las pestañas de "Servicios y equipo".
 *
 * Existen porque las pestañas son un Client Component (tienen estado) y un
 * Server Component solo puede pasarle objetos planos: una instancia de
 * `ServiceChecklist` o de `Trip` no se serializa. `toServiceTabs()` arma estos
 * datos en el servidor a partir de `servicesContent`.
 */

/** Un grupo de un panel: título, color de viñeta e ítems. */
export type ServiceGroupData = {
  /**
   * `key` del grupo: viaje + grupo (`'lolog-gear'`). Cambia con la pestaña a
   * propósito, para que React remonte la lista en vez de reconciliarla ítem
   * por ítem contra la del otro viaje.
   */
  readonly id: string;
  /** Título del grupo ("¿Qué necesito? · Ropa"). */
  readonly title: string;
  /** Color de las viñetas de la lista. */
  readonly dotTone: DotTone;
  /** Los ítems de la checklist, en orden. */
  readonly items: readonly string[];
};

/** Un panel de la grilla (una card): uno o dos grupos. */
export type ServicePanelData = {
  /**
   * `key` del panel: los grupos que lleva (`'transfers-notIncluded'`). Es el
   * mismo en todas las pestañas, así la card no se remonta al cambiar de viaje.
   */
  readonly id: string;
  /** Sus grupos, de arriba a abajo. */
  readonly groups: readonly ServiceGroupData[];
};

/** Una pestaña: el viaje y sus paneles, en el orden de la grilla. */
export type ServiceTabData = {
  /** El viaje: identifica la pestaña (ids de `tab` y estado de la activa). */
  readonly slug: TripSlug;
  /** Etiqueta del botón de la pestaña ("Calle & Stepanek"). */
  readonly label: string;
  /** Los paneles de la grilla, en orden. */
  readonly panels: readonly ServicePanelData[];
};

/** Las pestañas del selector. Nunca vacía: la primera es la que se ve al cargar. */
export type ServiceTabList = readonly [ServiceTabData, ...ServiceTabData[]];
