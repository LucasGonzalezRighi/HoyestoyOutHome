import type { SVGProps } from 'react';
import { siWhatsapp } from 'simple-icons';

/** Caja del logo en `simple-icons`: todos sus íconos se dibujan en 24×24. */
const VIEW_BOX = '0 0 24 24';

/**
 * Props de `WhatsAppIcon`. Acepta cualquier atributo de `<svg>` salvo los que
 * definen el dibujo (caja, lado y relleno), que son fijos.
 */
export type WhatsAppIconProps = {
  /** Lado en px. Por defecto 20, el de un botón; el botón flotante usa uno mayor. */
  size?: number;
  className?: string;
} & Omit<
  SVGProps<SVGSVGElement>,
  'width' | 'height' | 'viewBox' | 'fill' | 'children' | 'className' | 'ref'
>;

/**
 * Logo de WhatsApp: el ícono de todo botón o link que abre el chat. El trazo es
 * el oficial (`siWhatsapp` de `simple-icons`), no un dibujo propio: el cliente
 * pidió que se reconozca de un vistazo, y el globo genérico de Lucide no lo
 * lograba.
 *
 * Se pinta con `currentColor`, así toma el color del texto del botón (el verde
 * de WhatsApp no es de la paleta). A diferencia de los íconos de Lucide, es un
 * relleno y ocupa toda su caja: al mismo `size` se ve un poco más grande.
 *
 * Siempre acompaña a un texto o a un `aria-label` del link que lo contiene,
 * así que es decorativo (`aria-hidden`, y `focusable="false"` para que ningún
 * navegador lo meta en el orden de tabulación).
 */
export function WhatsAppIcon({ size = 20, className, ...rest }: WhatsAppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={VIEW_BOX}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d={siWhatsapp.path} />
    </svg>
  );
}
