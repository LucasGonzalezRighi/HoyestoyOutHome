import { describe, expect, it } from 'vitest';

import { Photo } from '../shared/Photo';

import { Guide, type GuideParams } from './Guide';

const params: GuideParams = {
  name: 'Andrés Gavilán',
  role: 'Guía de Montaña y Guía de Selva',
  instagramHandle: 'andres.gavilan',
  photo: new Photo({ src: '/images/team/andres.png', alt: 'Andrés Gavilán' }),
};

describe('Guide', () => {
  it('arma el link y la etiqueta de Instagram', () => {
    const guide = new Guide(params);
    expect(guide.instagramUrl).toBe('https://instagram.com/andres.gavilan');
    expect(guide.handleLabel).toBe('@andres.gavilan');
  });

  it('tira si el usuario trae "@" o caracteres inválidos', () => {
    expect(() => new Guide({ ...params, instagramHandle: '@andres.gavilan' })).toThrow('sin "@"');
    expect(() => new Guide({ ...params, instagramHandle: 'andres gavilan' })).toThrow();
    expect(() => new Guide({ ...params, instagramHandle: '' })).toThrow();
  });

  it('tira con nombre o rol en blanco', () => {
    expect(() => new Guide({ ...params, name: '' })).toThrow('El nombre del guía');
    expect(() => new Guide({ ...params, role: ' ' })).toThrow('El rol de Andrés Gavilán');
  });
});
