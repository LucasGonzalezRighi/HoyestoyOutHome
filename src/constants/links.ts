/**
 * Atributos de un link que sale de la landing (WhatsApp, Instagram, TikTok):
 * se esparcen en el `<a>` (`{...EXTERNAL_LINK_PROPS}`).
 *
 * - `target: '_blank'`: se abre en una pestaña nueva, así la landing queda
 *   abierta detrás (el funnel termina en WhatsApp, pero la persona vuelve).
 * - `noopener`: la página abierta no recibe `window.opener`, así no puede
 *   redirigir esta pestaña a otro sitio (_tabnabbing_). Los navegadores
 *   actuales ya lo implican con `_blank`; se escribe igual para los que no.
 * - `noreferrer`: el navegador no manda el `Referer`, así el sitio de destino
 *   no se entera de qué URL vino la visita. Es un agregado respecto del
 *   diseño, que pone solo `noopener` (CLAUDE.md §9).
 *
 * Vive en un solo lugar para que todos los links externos (`LinkButton`, el
 * footer, la galería y las cards del equipo) salgan con el mismo criterio.
 */
export const EXTERNAL_LINK_PROPS = { target: '_blank', rel: 'noopener noreferrer' } as const;
