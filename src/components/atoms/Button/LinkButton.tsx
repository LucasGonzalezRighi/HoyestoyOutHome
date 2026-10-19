import Link from 'next/link';

import { EXTERNAL_LINK_PROPS } from '@/constants/links';

import { buttonClassName } from './Button.styles';
import type { LinkButtonProps } from './Button.types';
import { isRouterHref } from './isRouterHref';

/**
 * Link con forma de botón: el mismo aspecto que `Button`.
 *
 * El elemento depende del destino:
 * - **Una página del sitio** (`/viajes/calle-stepanek`, `/#calendario`):
 *   `Link` de `next/link`, que navega con el router sin recargar la página
 *   (y precarga la ruta en producción). Renderiza el mismo `<a>`, así que el
 *   estilo no cambia. Una ruta con ancla (`/#faq`) lleva a esa sección también
 *   desde otra página.
 * - **Un ancla de la misma página** (`#viajes`), **otro esquema** (`mailto:`)
 *   **o `external`**: un `<a>` común. Con `external` (WhatsApp, Instagram) se
 *   abre en otra pestaña con `EXTERNAL_LINK_PROPS`, aunque el `href` empiece
 *   con `/`.
 *
 * La decisión la toma `isRouterHref`. Sigue siendo un Server Component: `Link`
 * es un Client Component, pero se puede renderizar desde el servidor.
 */
export function LinkButton({
  variant = 'primary',
  size = 'md',
  tone = 'default',
  icon,
  className,
  children,
  href,
  external = false,
  ...rest
}: LinkButtonProps) {
  const classes = buttonClassName(variant, size, tone, className);

  if (!external && isRouterHref(href)) {
    return (
      <Link href={href} className={classes} {...rest}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...(external ? EXTERNAL_LINK_PROPS : {})} {...rest}>
      {icon}
      {children}
    </a>
  );
}
