import { tripCatalog } from '@/content/catalog/trips';
import type { SectionHeadingContent } from '@/content/types';
import { ServiceChecklist, type ServiceGroupKind, type Trip } from '@/domain';

/** Una pestaña del selector: un viaje y lo que incluye / lo que hay que llevar. */
export type ServicesTabContent = {
  /** El viaje. Su `shortName` es la etiqueta de la pestaña ("Calle & Stepanek"). */
  readonly trip: Trip;
  /** Qué incluye el viaje y qué lleva el viajero (`data.calle` / `data.lolog` del diseño). */
  readonly checklist: ServiceChecklist;
};

/**
 * Un panel de la grilla: los grupos de la checklist que muestra, de arriba a
 * abajo. Nunca vacío (un panel sin grupos sería una card en blanco).
 */
export type ServicesPanelContent = readonly [ServiceGroupKind, ...ServiceGroupKind[]];

/**
 * Textos y datos de "09 Servicios y equipo"
 * (`docs/design/hoy-estoy-ooh-landing.dc.html:285-312`; listas en `data.calle` /
 * `data.lolog` y armado de paneles en `panels`, `dc.html:629-643` y `702-707`).
 */
export type ServicesContent = SectionHeadingContent & {
  /**
   * Una pestaña por viaje, en el orden del selector. **La primera es la que
   * se ve al cargar** (en el diseño, `state = { tab: 'calle' }`, `dc.html:408`).
   */
  readonly tabs: readonly [ServicesTabContent, ...ServicesTabContent[]];
  /** Título de cada grupo. Es copy, por eso vive acá y no en `ServiceChecklist`. */
  readonly groupTitles: { readonly [K in ServiceGroupKind]: string };
  /**
   * Composición de la grilla: qué grupos lleva cada panel. Es la misma para
   * todas las pestañas; lo que cambia son los ítems.
   */
  readonly panels: readonly ServicesPanelContent[];
};

/** Calle & Stepanek: `data.calle` del diseño (`dc.html:630-636`). */
const calleStepanekChecklist = new ServiceChecklist({
  included: [
    'Guías',
    'Refugio de montaña',
    'Pensión completa durante la travesía',
    'Equipo y botiquín principal de primeros auxilios',
    'Equipos de comunicación para emergencias: VHF',
    'Reuniones previas informativas',
    'Seguro de accidentes personales',
    'Asistencia y coordinación permanente',
  ],
  transfers: ['Mendoza a Vallecitos', 'Vallecitos a Mendoza'],
  notIncluded: ['Viaje hasta Mendoza Capital', 'Gastos por abandono del programa'],
  clothing: [
    'Camiseta sintética',
    'Remera sintética manga corta',
    'Medias sintéticas (2 pares)',
    'Guantes',
    'Buff (cuello sintético)',
    'Ropa interior',
    'Buzo micropolar',
    'Pantalón de trekking',
    'Campera de abrigo (tipo Uniqlo)',
    'Parka impermeable',
    'Gorro de lana',
    'Gorra de sol',
    'Botas de trekking',
  ],
  gear: [
    'Mochila mediana',
    'Bastones de trekking',
    'Lentes de sol',
    'Papel higiénico / toallas húmedas',
    'Kit de higiene personal',
    'Medicamentos personales',
    'Protectores: solar y labial',
    'Linterna frontal',
    '2 L de agua',
  ],
});

/** Lago Lolog: `data.lolog` del diseño (`dc.html:637-643`). */
const lologChecklist = new ServiceChecklist({
  included: [
    'Guías habilitados',
    'Carpas de montaña',
    'Pensión completa (no incluye día 0 y cena del día 4)',
    'Equipo y botiquín principal de primeros auxilios',
    'Equipos de comunicación para emergencias: VHF',
    'Reuniones previas informativas',
    'Seguro de accidentes personales',
    'Asistencia y coordinación permanente',
  ],
  transfers: [
    'San Martín de los Andes hasta Puerto Arturo',
    'Laguna Verde hasta San Martín de los Andes',
  ],
  notIncluded: ['Viaje hasta San Martín de los Andes', 'Gastos por abandono del programa'],
  clothing: [
    'Camiseta térmica sintética',
    'Remera sintética manga corta',
    'Medias sintéticas',
    'Guantes (tipo mágicos)',
    'Buff',
    'Ropa interior',
    'Buzo micropolar',
    'Pantalón de trekking',
    'Campera tipo Uniqlo',
    'Parka impermeable',
    'Gorro de lana',
    'Gorra de sol',
    'Botas de trekking',
    'Calzado tipo Crocs para campamento',
    'Zapatillas para mojar',
  ],
  gear: [
    'Bolsa de dormir (límite −8 / −10 °C)',
    'Aislante',
    'Mochila de 60 litros en adelante',
    'Cubremochila',
    'Bastones de trekking',
    'Lentes de sol',
    'Papel higiénico / toallas húmedas',
    'Kit de higiene personal',
    'Toalla chica (secado rápido)',
    'Protectores: solar y labial',
    'Repelente de insectos',
    'Linterna frontal',
    'Botella de 1 L',
  ],
});

/**
 * Contenido de la sección 09. Las etiquetas de las pestañas salen del
 * catálogo (`shortName`), así un cambio de nombre del viaje llega solo.
 */
export const servicesContent: ServicesContent = {
  eyebrow: 'Servicios y equipo',
  title: '¿Qué incluye y qué necesito?',
  tabs: [
    { trip: tripCatalog.get('calle-stepanek'), checklist: calleStepanekChecklist },
    { trip: tripCatalog.get('lolog'), checklist: lologChecklist },
  ],
  groupTitles: {
    included: 'Servicios incluidos',
    transfers: 'Traslados',
    notIncluded: 'Servicios NO incluidos',
    clothing: '¿Qué necesito? · Ropa',
    gear: '¿Qué necesito? · Equipo',
  },
  // `panels` del diseño (`dc.html:702-707`): [incluidos] · [traslados + NO
  // incluidos] · [ropa] · [equipo].
  panels: [['included'], ['transfers', 'notIncluded'], ['clothing'], ['gear']],
};
