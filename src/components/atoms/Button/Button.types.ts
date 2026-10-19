import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Variantes del `.btn` del design system.
 *
 * Las dos comparten el efecto de la marca: al pasar el cursor, un relleno
 * verde musgo avanza de izquierda a derecha y el texto pasa a crema.
 */
export type ButtonVariant =
  /** Sólido dorado — "Ver próximos viajes", "Escribinos", "Ver detalles", "Consultar por WhatsApp". */
  | 'primary'
  /** Contorno — "Hablá con nosotros" (sobre la foto del hero, con `tone="inverse"`), "Ver viaje" del calendario. */
  | 'secondary';

/**
 * Tamaños. `md` es el `.btn` del design system; los otros dos son los que el
 * diseño fija inline en los CTA grandes.
 */
export type ButtonSize =
  /** 14px, padding del design system. Nav, cards de viaje, calendario. */
  | 'md'
  /** 16px, padding 14px 26px. CTA del hero, de la portada de cada viaje y del formulario. */
  | 'lg'
  /** 17px, padding 16px 32px. CTA del cierre de cada viaje ("Consultar por WhatsApp"). */
  | 'xl';

/**
 * Sobre qué fondo va el botón.
 *
 * `inverse` es para ir sobre una foto: texto crema y, en `secondary`, borde
 * crema al 70%. En el diseño son estilos inline, así que se mantienen también
 * en hover (solo avanza el relleno).
 */
export type ButtonTone = 'default' | 'inverse';

type ButtonBaseProps = {
  /** Por defecto `primary`. */
  variant?: ButtonVariant;
  /** Por defecto `md`. */
  size?: ButtonSize;
  /** Por defecto `default`. */
  tone?: ButtonTone;
  /** Ícono antes del label (p. ej. `<WhatsAppIcon />`). Se separa del texto con el gap de 6px del `.btn`. */
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
};

/** Props de `Button`: las comunes más cualquier atributo de `<button>` (`onClick`, `aria-pressed`, `data-*`…). */
export type ButtonProps = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>;

/** Props de `LinkButton`: las comunes más cualquier atributo de `<a>`. */
export type LinkButtonProps = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps | 'href'> & {
    /**
     * Destino. Una ruta del sitio (`tripPath(slug)`, `homeAnchorTo('faq')`)
     * navega con el router de Next, sin recargar; un ancla de la misma página
     * (`anchorTo('trips')`), un `mailto:` o una URL de otro sitio van como
     * `<a>` común. Siempre armado con las funciones de `constants/`, nunca
     * literal.
     */
    href: string;
    /**
     * Link a otro sitio (WhatsApp, Instagram): abre en otra pestaña con
     * `rel="noopener noreferrer"`, para que la página abierta no tenga acceso
     * a `window.opener` ni reciba el referrer. Siempre es un `<a>` común.
     */
    external?: boolean;
  };
