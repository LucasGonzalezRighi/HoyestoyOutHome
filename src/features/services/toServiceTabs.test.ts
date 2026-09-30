import { describe, expect, it } from 'vitest';

import { servicesContent } from '@/content/sections/services';

import { toServiceTabs } from './toServiceTabs';

describe('toServiceTabs', () => {
  const tabs = toServiceTabs(servicesContent);

  it('arma una pestaña por viaje, con Calle & Stepanek primero (la que se ve al cargar)', () => {
    expect(tabs.map((tab) => [tab.slug, tab.label])).toEqual([
      ['calle-stepanek', 'Calle & Stepanek'],
      ['lolog', 'Lago Lolog'],
    ]);
  });

  it('compone los paneles como el diseño: incluidos · traslados + NO incluidos · ropa · equipo', () => {
    for (const tab of tabs) {
      expect(tab.panels.map((panel) => panel.groups.map((group) => group.title))).toEqual([
        ['Servicios incluidos'],
        ['Traslados', 'Servicios NO incluidos'],
        ['¿Qué necesito? · Ropa'],
        ['¿Qué necesito? · Equipo'],
      ]);
    }
  });

  it('pinta las viñetas según quién pone cada cosa', () => {
    const tones = tabs[0].panels.flatMap((panel) => panel.groups.map((group) => group.dotTone));
    expect(tones).toEqual(['accent-2', 'accent-2', 'neutral', 'accent', 'accent']);
  });

  it('toma los ítems de la checklist de cada viaje', () => {
    const [calle, lolog] = servicesContent.tabs.map((tab) => tab.checklist);
    expect(tabs[0].panels[1]?.groups[0]?.items).toEqual(calle?.transfers);
    expect(tabs[1]?.panels[3]?.groups[0]?.items).toEqual(lolog?.gear);
  });

  it('conserva las cards entre pestañas y remonta las listas (keys de panel fijas, de grupo por viaje)', () => {
    const [calle, lolog] = tabs;
    const panelIds = (tab: typeof calle) => tab.panels.map((panel) => panel.id);
    const groupIds = (tab: typeof calle) =>
      tab.panels.flatMap((panel) => panel.groups.map((group) => group.id));
    expect(lolog && panelIds(lolog)).toEqual(panelIds(calle));
    expect(groupIds(calle)).toEqual([
      'calle-stepanek-included',
      'calle-stepanek-transfers',
      'calle-stepanek-notIncluded',
      'calle-stepanek-clothing',
      'calle-stepanek-gear',
    ]);
    expect(lolog && groupIds(lolog)).toEqual(
      groupIds(calle).map((id) => id.replace('calle-stepanek', 'lolog')),
    );
  });

  it('devuelve datos planos: sobreviven a una serialización sin perder nada', () => {
    expect(JSON.parse(JSON.stringify(tabs))).toStrictEqual(tabs);
  });
});
