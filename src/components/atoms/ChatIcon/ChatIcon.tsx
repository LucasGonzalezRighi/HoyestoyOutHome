import { type LucideProps, MessageCircle } from 'lucide-react';

/**
 * Trazo de todos los íconos. Regla del design system Organic: Lucide a 2.75,
 * más redondo y pesado que el 2 por defecto.
 */
const ICON_STROKE_WIDTH = 2.75;

/** Props de `ChatIcon`. Acepta cualquier atributo de `<svg>` salvo el trazo, que es fijo. */
export type ChatIconProps = {
  /** Lado en px. Por defecto 20 (CTA del cierre); el botón flotante usa 27. */
  size?: number;
  className?: string;
} & Omit<LucideProps, 'size' | 'strokeWidth' | 'className' | 'ref'>;

/**
 * Globo de chat — el ícono de WhatsApp de la landing. Es el mismo path que
 * trae el diseño inline (`message-circle` de Lucide).
 *
 * Siempre acompaña a un texto o a un `aria-label` del link que lo contiene,
 * así que es decorativo (`aria-hidden`).
 */
export function ChatIcon({ size = 20, className, ...rest }: ChatIconProps) {
  return (
    <MessageCircle
      size={size}
      strokeWidth={ICON_STROKE_WIDTH}
      aria-hidden="true"
      className={className}
      {...rest}
    />
  );
}
