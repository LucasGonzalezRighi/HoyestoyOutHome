import { EXTERNAL_LINK_PROPS } from '@/constants/links';

import { buttonClassName } from './Button.styles';
import type { LinkButtonProps } from './Button.types';

/**
 * Link con forma de botón (`<a>`): el mismo aspecto que `Button`.
 *
 * Es un `<a>` común y no el `Link` de Next a propósito: los destinos de la
 * landing son anclas (`#viajes`) o sitios externos (WhatsApp), y ninguno es
 * una navegación del router.
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
  return (
    <a
      href={href}
      className={buttonClassName(variant, size, tone, className)}
      {...(external ? EXTERNAL_LINK_PROPS : {})}
      {...rest}
    >
      {icon}
      {children}
    </a>
  );
}
