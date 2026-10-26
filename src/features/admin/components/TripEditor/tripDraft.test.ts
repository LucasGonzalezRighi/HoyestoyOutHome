import { describe, expect, it } from 'vitest';

import { SEED_TRIPS } from '@/content/seed/trips';

import { framingPosition, parseNumber, verticalFraming } from '../ui/inputValues';

import { fromDraft, slugify, tabOfPath, toDraft } from './tripDraft';

describe('slugify', () => {
  it('saca tildes, pasa a minúsculas y une con guiones', () => {
    expect(slugify('Cajón del Azul & Hielo Azul')).toBe('cajon-del-azul-y-hielo-azul');
    expect(slugify('  Cerro Ñuble — 2027!  ')).toBe('cerro-nuble-2027');
    expect(slugify('')).toBe('');
  });
});

describe('toDraft / fromDraft', () => {
  it('un viaje guardado vuelve igual después de pasar por el editor', () => {
    for (const trip of SEED_TRIPS) {
      expect(fromDraft(toDraft(trip))).toEqual(trip);
    }
  });

  it('apagar un bloque lo saca de lo guardado sin perder lo escrito', () => {
    const [calle] = SEED_TRIPS;
    const draft = toDraft(calle);
    draft.checklist.enabled = false;
    expect(fromDraft(draft).checklist).toBeUndefined();
    draft.checklist.enabled = true;
    expect(fromDraft(draft).checklist).toEqual(calle?.checklist);
  });

  it('la portada usa el destino y el nombre si quedaron vacíos', () => {
    const draft = toDraft(undefined);
    draft.base.name = 'Cerro Plata';
    draft.base.destination = 'Mendoza';
    expect(fromDraft(draft).cover).toEqual({ eyebrow: 'Mendoza', titleRest: 'Cerro Plata' });
  });
});

describe('tabOfPath', () => {
  it('ubica cada error en su pestaña', () => {
    expect(tabOfPath('itinerary.2.title')).toBe('itinerary');
    expect(tabOfPath('stats.items.0.value')).toBe('overview');
    expect(tabOfPath('photo.alt')).toBe('basics');
    expect(tabOfPath('')).toBe('basics');
  });
});

describe('parseNumber', () => {
  it('lee números como se escriben en Argentina', () => {
    expect(parseNumber('11,3')).toBe(11.3);
    expect(parseNumber('4.290')).toBe(4290);
    expect(parseNumber('1.900,5')).toBe(1900.5);
    expect(parseNumber('8.8')).toBe(8.8);
    expect(parseNumber(' 24 ')).toBe(24);
    expect(parseNumber('')).toBeUndefined();
    expect(parseNumber('doce')).toBeNaN();
  });
});

describe('encuadre vertical', () => {
  it('va y vuelve entre el porcentaje y el `object-position`', () => {
    expect(verticalFraming('center 62%')).toBe(62);
    expect(verticalFraming(undefined)).toBe(50);
    expect(verticalFraming('left top')).toBe(50);
    expect(framingPosition(30)).toBe('center 30%');
    expect(framingPosition(50)).toBeUndefined();
  });
});
