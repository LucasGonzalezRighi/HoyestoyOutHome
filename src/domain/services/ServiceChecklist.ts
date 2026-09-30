import { assertTextList } from '../shared/invariants';

/**
 * Los grupos de la checklist, en el orden en que se muestran: primero lo que
 * pone la empresa, después lo que pone el viajero.
 */
export const SERVICE_GROUP_KINDS = [
  'included',
  'transfers',
  'notIncluded',
  'clothing',
  'gear',
] as const;

/** Un grupo de la checklist. `content/` indexa por esta clave el título de cada pestaña. */
export type ServiceGroupKind = (typeof SERVICE_GROUP_KINDS)[number];

/**
 * Un grupo de la checklist. Es un objeto plano a propósito: es lo que cruza a
 * la pestaña de Servicios, que es Client Component y no puede recibir
 * instancias de clases.
 */
export type ServiceGroup = {
  readonly kind: ServiceGroupKind;
  readonly items: readonly string[];
};

/** Datos para crear una `ServiceChecklist`: un array por grupo. */
export type ServiceChecklistParams = { readonly [K in ServiceGroupKind]: readonly string[] };

/**
 * Qué incluye un viaje y qué tiene que llevar el viajero (sección 09 del
 * diseño, una checklist por pestaña).
 *
 * Invariante: los cinco grupos tienen al menos un ítem y ninguno en blanco.
 * El título de cada grupo ("Servicios incluidos", "¿Qué necesito? · Ropa") es
 * copy y vive en `content/`, indexado por `kind`.
 */
export class ServiceChecklist {
  private readonly props: ServiceChecklistParams;

  constructor(params: ServiceChecklistParams) {
    this.props = Object.freeze({
      included: assertTextList(params.included, 'Los servicios incluidos'),
      transfers: assertTextList(params.transfers, 'Los traslados'),
      notIncluded: assertTextList(params.notIncluded, 'Los servicios no incluidos'),
      clothing: assertTextList(params.clothing, 'La lista de ropa'),
      gear: assertTextList(params.gear, 'La lista de equipo'),
    });
  }

  get included(): readonly string[] {
    return this.props.included;
  }

  get transfers(): readonly string[] {
    return this.props.transfers;
  }

  get notIncluded(): readonly string[] {
    return this.props.notIncluded;
  }

  get clothing(): readonly string[] {
    return this.props.clothing;
  }

  get gear(): readonly string[] {
    return this.props.gear;
  }

  /** Los cinco grupos, en el orden de `SERVICE_GROUP_KINDS`, como datos planos. */
  groups(): readonly ServiceGroup[] {
    return SERVICE_GROUP_KINDS.map((kind) => ({ kind, items: this.props[kind] }));
  }
}
