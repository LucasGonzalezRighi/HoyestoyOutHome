/**
 * Rutas de los archivos estáticos de `public/`.
 *
 * Ningún componente escribe una ruta de imagen a mano: las fotos se registran
 * una sola vez en `src/content/media.ts` usando estos directorios.
 */
export const ASSET_DIRS = {
  photos: '/images/photos',
  food: '/images/food',
  team: '/images/team',
} as const;

/** Logo de la marca (PNG con fondo blanco: se muestra con `mix-blend-mode: multiply`). */
export const BRAND_LOGO = {
  src: '/brand/logo-ooh.png',
  width: 149,
  height: 172,
} as const;
