/**
 * ¿Este `href` es una página del sitio, que tiene que navegar el router de
 * Next (`next/link`) en vez de recargar la página?
 *
 * Sí cuando es una ruta absoluta del propio sitio: empieza con una sola `/`
 * (`/viajes/calle-stepanek`, `/`, `/#calendario`). No cuando es:
 * - una ancla de la misma página (`#viajes`): la resuelve el navegador, sin
 *   router;
 * - una URL de otro sitio (`https://wa.me/…`) o de otro esquema (`mailto:`,
 *   `tel:`);
 * - una URL relativa al protocolo (`//otro-sitio.com`), que el navegador
 *   trata como de otro dominio. `/\` también: los navegadores la leen igual
 *   que `//`.
 */
export function isRouterHref(href: string): boolean {
  if (!href.startsWith('/')) return false;
  const second = href.charAt(1);
  return second !== '/' && second !== '\\';
}
