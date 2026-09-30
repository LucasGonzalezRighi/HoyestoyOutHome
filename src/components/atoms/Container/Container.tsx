import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Container.module.css';

/** Elementos que puede renderizar `Container`. */
export type ContainerElement = 'div' | 'section' | 'main' | 'header' | 'footer';

/** Anchos máximos del layout. */
export type ContainerWidth =
  /** `--layout-max` (1240px): el ancho de los `<main>` del diseño. */
  | 'default'
  /** `--layout-narrow` (1100px): tarjeta de precio y footer del cierre. */
  | 'narrow';

const WIDTH_CLASSES: Record<ContainerWidth, string | undefined> = {
  default: undefined,
  narrow: styles.narrow,
};

/** Props de `Container`. Acepta cualquier atributo HTML del elemento elegido. */
export type ContainerProps = {
  /** Por defecto `div`. */
  as?: ContainerElement;
  /** Por defecto `default`. */
  width?: ContainerWidth;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

/**
 * Centra el contenido y le aplica el margen lateral del diseño
 * (`--layout-gutter`).
 *
 * Reemplaza a los tres `<main>` del HTML exportado: la página tiene un solo
 * `<main>` y cada sección se contiene con esto.
 */
export function Container({
  as: Root = 'div',
  width = 'default',
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Root className={cn(styles.container, WIDTH_CLASSES[width], className)} {...rest}>
      {children}
    </Root>
  );
}
