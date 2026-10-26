import { describe, expect, it } from 'vitest';

import { buildSiteContent } from '@/content';
import { SEED_RECORD } from '@/content/seed';

import { checklistPanels } from './checklistPanels';

/** Las páginas de viaje del contenido inicial. */
const site = buildSiteContent(SEED_RECORD, '2026-01-01');

/** La página de un viaje del contenido inicial (tira si no está). */
function detailOf(slug: string) {
  const detail = site.tripDetail(slug);
  if (!detail) throw new Error(`${slug} no tiene página`);
  return detail;
}

/** La checklist de un viaje que la tiene (tira si el contenido la perdió). */
function checklistOf(slug: string) {
  const { checklist } = detailOf(slug);
  if (!checklist) throw new Error(`${slug} no tiene checklist`);
  return checklist;
}

describe('checklistPanels', () => {
  const calle = checklistOf('calle-stepanek');
  const lolog = checklistOf('lago-lolog-laguna-verde');

  it('compone las cards como el diseño: incluidos · traslados + NO incluidos · ropa · equipo', () => {
    for (const content of [calle, lolog]) {
      expect(
        checklistPanels(content).map((panel) => panel.groups.map((group) => group.title)),
      ).toEqual([
        ['Servicios incluidos'],
        ['Traslados', 'Servicios NO incluidos'],
        ['¿Qué necesito? · Ropa'],
        ['¿Qué necesito? · Equipo'],
      ]);
    }
  });

  it('pinta las viñetas según quién pone cada cosa', () => {
    const tones = checklistPanels(calle).flatMap((panel) =>
      panel.groups.map((group) => group.dotTone),
    );
    expect(tones).toEqual(['accent-2', 'accent-2', 'neutral', 'accent', 'accent']);
  });

  it('toma los ítems de la checklist de cada viaje', () => {
    expect(checklistPanels(calle)[1]?.groups[0]?.items).toEqual(calle.checklist.transfers);
    expect(checklistPanels(lolog)[3]?.groups[0]?.items).toEqual(lolog.checklist.gear);
  });

  it('identifica cada card por los grupos que lleva', () => {
    expect(checklistPanels(calle).map((panel) => panel.id)).toEqual([
      'included',
      'transfers-notIncluded',
      'clothing',
      'gear',
    ]);
  });

  it('los viajes sin programa no tienen checklist (la página no muestra el bloque)', () => {
    expect(detailOf('laguna-negra').checklist).toBeUndefined();
    expect(detailOf('cajon-del-azul').checklist).toBeUndefined();
  });
});
