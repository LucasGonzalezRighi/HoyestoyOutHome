/**
 * Las rutas del sitio: el home y una página por viaje (`/viajes/<slug>`).
 *
 * Prohibido escribir una ruta literal en un componente o en el contenido:
 * siempre se arma con estas funciones, así un cambio de URL se hace en un solo
 * lugar (links, `generateStaticParams`, sitemap y canonical leen de acá).
 *
 * El slug es el del catálogo (`TripSlug`), que se eligió para que sirva tal
 * cual como URL: minúsculas, sin espacios ni `&` (los links con esos
 * caracteres se rompen al compartirlos por WhatsApp).
 */
export const ROUTES = {
  home: '/',
  /** Prefijo de las páginas de viaje. No es una página en sí: el listado está en el home (`/#viajes`). */
  trips: '/viajes',
} as const;

/** Ruta de la página de un viaje: `tripPath('calle-stepanek')` → `/viajes/calle-stepanek`. */
export function tripPath(slug: string): string {
  return `${ROUTES.trips}/${slug}`;
}
