import { describe, expect, it } from 'vitest';

import { ServiceChecklist, type ServiceChecklistParams } from './ServiceChecklist';

const params: ServiceChecklistParams = {
  included: ['Guías', 'Refugio de montaña'],
  transfers: ['Mendoza a Vallecitos'],
  notIncluded: ['Viaje hasta Mendoza Capital'],
  clothing: ['Guantes'],
  gear: ['Linterna frontal'],
};

describe('ServiceChecklist', () => {
  it('devuelve los grupos en el orden del diseño', () => {
    const groups = new ServiceChecklist(params).groups();
    expect(groups.map((group) => group.kind)).toEqual([
      'included',
      'transfers',
      'notIncluded',
      'clothing',
      'gear',
    ]);
    expect(groups[0]?.items).toEqual(['Guías', 'Refugio de montaña']);
  });

  it('los grupos son datos planos (pueden cruzar a un Client Component)', () => {
    const [first] = new ServiceChecklist(params).groups();
    expect(Object.getPrototypeOf(first)).toBe(Object.prototype);
  });

  it('las listas quedan congeladas y separadas del array original', () => {
    const source = ['Guías'];
    const checklist = new ServiceChecklist({ ...params, included: source });
    source.push('Otro');
    expect(checklist.included).toEqual(['Guías']);
    expect(Object.isFrozen(checklist.included)).toBe(true);
  });

  it('tira con grupos vacíos o ítems en blanco', () => {
    expect(() => new ServiceChecklist({ ...params, gear: [] })).toThrow('La lista de equipo');
    expect(() => new ServiceChecklist({ ...params, transfers: [''] })).toThrow('Los traslados');
  });
});
