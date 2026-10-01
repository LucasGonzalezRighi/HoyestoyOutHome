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

/**
 * Imagen para compartir el link (Open Graph y Twitter): la foto del hero
 * (`PHOTOS.heroRange`) recortada a 1200×630, la proporción 1,91:1 que piden
 * `summary_large_image` y las tarjetas de Facebook y LinkedIn.
 *
 * Es un archivo aparte y no la foto original (1600×1200, 514 KB) porque
 * WhatsApp —el canal del funnel— suele no mostrar la miniatura si la imagen
 * pesa mucho: este recorte es un JPEG de ~148 KB (mozjpeg, calidad 77), con el
 * encuadre `center` del hero. Si cambia la foto del hero, se regenera.
 *
 * Ancho, alto y tipo van a la metadata (`og:image:width`, `og:image:height`,
 * `og:image:type`): con eso las plataformas arman la tarjeta sin tener que
 * bajar la imagen para medirla.
 */
export const SHARE_IMAGE_ASSET = {
  src: '/images/og/hero-range-share-1200x630.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
} as const;
