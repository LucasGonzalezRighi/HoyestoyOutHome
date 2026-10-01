import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './Container.module.css';

/** Elementos que puede renderizar `Container`. */
export type ContainerElement = 'div' | 'section' | 'main' | 'header' | 'footer';

/** Props de `Container`. Acepta cualquier atributo HTML del elemento elegido. */
export type ContainerProps = {
  /** Por defecto `div`. */
  as?: ContainerElement;
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

/**
 * Centra el contenido con el ancho máximo de los `<main>` del diseño
 * (`--layout-max`) y le aplica su margen lateral (`--layout-gutter`).
 *
 * Reemplaza a los tres `<main>` del HTML exportado: la página tiene un solo
 * `<main>` y cada sección se contiene con esto.
 */
export function Container({ as: Root = 'div', className, children, ...rest }: ContainerProps) {
  return (
    <Root className={cn(styles.container, className)} {...rest}>
      {children}
    </Root>
  );
}
