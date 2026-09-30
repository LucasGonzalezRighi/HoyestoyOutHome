import { buttonClassName } from './Button.styles';
import type { ButtonProps } from './Button.types';

/**
 * Botón de acción (`<button>`), con el `.btn` del design system y el relleno
 * verde musgo de la marca.
 *
 * `type="button"` por defecto: la landing no tiene formularios, y un
 * `<button>` sin tipo dentro de uno lo enviaría sin querer.
 *
 * Para navegar (anclas, WhatsApp) usar `LinkButton`.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  tone = 'default',
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClassName(variant, size, tone, className)} {...rest}>
      {icon}
      {children}
    </button>
  );
}
