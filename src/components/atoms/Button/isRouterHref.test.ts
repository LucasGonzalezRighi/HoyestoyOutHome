import { describe, expect, it } from 'vitest';

import { isRouterHref } from './isRouterHref';

describe('isRouterHref', () => {
  it('acepta las rutas del sitio', () => {
    expect(isRouterHref('/')).toBe(true);
    expect(isRouterHref('/viajes/calle-stepanek')).toBe(true);
  });

  it('acepta un ancla del home desde cualquier página', () => {
    expect(isRouterHref('/#calendario')).toBe(true);
  });

  it('deja al navegador las anclas de la misma página', () => {
    expect(isRouterHref('#viajes')).toBe(false);
  });

  it('deja al navegador los links a otros sitios y esquemas', () => {
    expect(isRouterHref('https://wa.me/5492610000000')).toBe(false);
    expect(isRouterHref('mailto:hola@example.com')).toBe(false);
    expect(isRouterHref('tel:+5492610000000')).toBe(false);
  });

  it('no confunde una URL relativa al protocolo con una ruta', () => {
    expect(isRouterHref('//otro-sitio.com')).toBe(false);
    expect(isRouterHref('/\\otro-sitio.com')).toBe(false);
  });

  it('rechaza el href vacío', () => {
    expect(isRouterHref('')).toBe(false);
  });
});
