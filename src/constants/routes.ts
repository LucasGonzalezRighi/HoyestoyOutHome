/**
 * Las rutas del sitio: el home, una página por viaje (`/viajes/<slug>`) y el
 * panel de administración (`/admin`).
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

/**
 * Rutas del panel de administración. Todas cuelgan de `/admin`: el proxy
 * (`src/proxy.ts`) las protege juntas y `robots.txt` las excluye juntas.
 */
export const ADMIN_ROUTES = {
  home: '/admin',
  login: '/admin/login',
  trips: '/admin/viajes',
  newTrip: '/admin/viajes/nuevo',
  departures: '/admin/salidas',
  faq: '/admin/preguntas',
  testimonials: '/admin/testimonios',
  texts: '/admin/textos',
} as const;

/**
 * Editor de un viaje: `adminTripPath('calle-stepanek')` → `/admin/viajes/editar/calle-stepanek`.
 * Va bajo `editar/` para que ningún slug choque con `nuevo`.
 */
export function adminTripPath(slug: string): string {
  return `${ADMIN_ROUTES.trips}/editar/${slug}`;
}
