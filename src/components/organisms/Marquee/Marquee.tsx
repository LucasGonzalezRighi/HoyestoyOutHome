import { Fragment, type HTMLAttributes, type ReactNode } from 'react';

import { marquee } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './Marquee.module.css';

/** Datos que recibe `renderItem` además del ítem. */
export type MarqueeItemMeta = {
  /** Posición del ítem dentro de `items` (se repite en la copia). */
  index: number;
  /**
   * `true` en la segunda copia. Quien renderiza le pone `aria-hidden` (y saca
   * del orden de tabulación lo que sea enfocable) para que el lector de
   * pantalla no lea todo dos veces.
   */
  isClone: boolean;
};

/** Props de `Marquee`. El resto de los atributos va al riel. */
export type MarqueeProps<T> = {
  items: readonly T[];
  renderItem: (item: T, meta: MarqueeItemMeta) => ReactNode;
  /** Clave estable de cada ítem. Por defecto, su índice (las cintas son listas fijas). */
  getKey?: (item: T, index: number) => string;
  /** 1 = hacia la izquierda (por defecto), -1 = hacia la derecha. */
  direction?: 1 | -1;
  /** px por frame antes de sumar la velocidad del scroll. Si falta, el motor usa 0.7. */
  speed?: number;
  /** Clase del riel: el `gap` y la tipografía los pone quien lo usa. */
  className?: string;
  /** `ul` cuando los ítems son una lista (y `renderItem` devuelve `<li>`). Por defecto `div`. */
  as?: 'div' | 'ul';
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

/** Las dos pasadas del contenido: la original y la copia. */
const PASSES = [false, true] as const;

function indexKey(_item: unknown, index: number): string {
  return String(index);
}

/**
 * Cinta infinita: la cinta del hero, los testimonios y las dos filas de la
 * galería.
 *
 * **Renderiza los ítems exactamente dos veces.** El motor traslada el riel
 * hacia un costado y, cuando avanzó la mitad de su ancho (una copia entera),
 * lo vuelve a poner en cero: como la segunda mitad es idéntica a la primera,
 * el salto no se ve. Con una sola copia quedaría un hueco; con tres, el salto
 * se notaría.
 *
 * El riel es `width: max-content` para que su ancho sea el del contenido y no
 * el de la pantalla: de eso depende la cuenta de la mitad. Quien lo usa pone
 * `overflow: hidden` en el contenedor.
 */
export function Marquee<T>({
  items,
  renderItem,
  getKey = indexKey,
  direction = 1,
  speed,
  className,
  as: Rail = 'div',
  ...rest
}: MarqueeProps<T>) {
  return (
    <Rail className={cn(styles.rail, className)} {...marquee({ direction, speed })} {...rest}>
      {PASSES.map((isClone) =>
        items.map((item, index) => (
          <Fragment key={`${isClone ? 'clone' : 'original'}-${getKey(item, index)}`}>
            {renderItem(item, { index, isClone })}
          </Fragment>
        )),
      )}
    </Rail>
  );
}
