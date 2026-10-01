import { describe, expect, it } from 'vitest';

import { resolveSiteUrl } from './siteUrl';

describe('resolveSiteUrl', () => {
  it('usa NEXT_PUBLIC_APP_URL si está cargada, aunque Vercel defina su dominio', () => {
    const url = resolveSiteUrl({
      NEXT_PUBLIC_APP_URL: 'https://hoyestoyooh.com.ar',
      VERCEL_PROJECT_PRODUCTION_URL: 'hoy-estoy-out-home.vercel.app',
      VERCEL_ENV: 'production',
    });
    expect(url.href).toBe('https://hoyestoyooh.com.ar/');
  });

  it('con NEXT_PUBLIC_APP_URL vacía cae al dominio de producción de Vercel, con https', () => {
    const url = resolveSiteUrl({
      NEXT_PUBLIC_APP_URL: '  ',
      VERCEL_PROJECT_PRODUCTION_URL: 'hoy-estoy-out-home.vercel.app',
      VERCEL_ENV: 'production',
    });
    expect(url.href).toBe('https://hoy-estoy-out-home.vercel.app/');
  });

  it('en un preview también apunta a producción (el canonical no es el preview)', () => {
    const url = resolveSiteUrl({
      VERCEL_PROJECT_PRODUCTION_URL: 'hoy-estoy-out-home.vercel.app',
      VERCEL_ENV: 'preview',
    });
    expect(url.origin).toBe('https://hoy-estoy-out-home.vercel.app');
  });

  it('sin variables queda en localhost (desarrollo y build local)', () => {
    expect(resolveSiteUrl({}).href).toBe('http://localhost:3000/');
  });

  it('no tira por un build de producción local: NODE_ENV no decide', () => {
    const env = { NODE_ENV: 'production', NEXT_PUBLIC_APP_URL: '' };
    expect(resolveSiteUrl(env).origin).toBe('http://localhost:3000');
  });

  it('tira en producción de Vercel si la URL cae en localhost', () => {
    expect(() => resolveSiteUrl({ VERCEL_ENV: 'production' })).toThrow(/localhost/);
    expect(() =>
      resolveSiteUrl({
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
        VERCEL_PROJECT_PRODUCTION_URL: 'hoy-estoy-out-home.vercel.app',
        VERCEL_ENV: 'production',
      }),
    ).toThrow(/NEXT_PUBLIC_APP_URL/);
    expect(() =>
      resolveSiteUrl({ NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3000', VERCEL_ENV: 'production' }),
    ).toThrow(/localhost/);
  });

  it('tira con un mensaje que nombra la variable si no es una URL absoluta', () => {
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_APP_URL: 'hoyestoyooh.com.ar' })).toThrow(
      /NEXT_PUBLIC_APP_URL no es una URL absoluta/,
    );
  });
});
