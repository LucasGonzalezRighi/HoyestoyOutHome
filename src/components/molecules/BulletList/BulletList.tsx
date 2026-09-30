import type { HTMLAttributes } from 'react';

import { Dot, type DotTone } from '@/components/atoms/Dot';
import { reveal } from '@/motion/attributes';
import { cn } from '@/utils/cn';

import styles from './BulletList.module.css';

/** Peso del texto de la lista. */
export type BulletListVariant =
  /** Texto normal (listas de servicios). */
  | 'default'
  /** Seminegrita en verde musgo oscuro: "Ideal si:" / "Trabajamos con:". */
  | 'emphasis';

/** Densidad de la lista. */
export type BulletListSize =
  /** gap 9px y punto de 8px ("¿Es para mí?"). */
  | 'md'
  /** gap 7px, 15px/1.5 y punto de 7px (paneles de servicios). */
  | 'sm';

const SIZE_CLASSES: Record<BulletListSize, string | undefined> = {
  md: styles.sizeMd,
  sm: styles.sizeSm,
};

const DOT_SIZES = { md: 8, sm: 7 } as const satisfies Record<BulletListSize, number>;

/**
 * Escalonado de entrada de cada ítem: porción del viewport que dura la
 * aparición (`data-rv-span="0.16"` de las listas de "¿Es para mí?").
 */
const ITEM_REVEAL_SPAN = 0.16;

/** Props de `BulletList`. El resto de los atributos va al `<ul>`. */
export type BulletListProps = {
  items: readonly string[];
  /** Color de las viñetas. Por defecto `accent`. */
  dotTone?: DotTone;
  /** Por defecto `default`. */
  variant?: BulletListVariant;
  /** Por defecto `md`. */
  size?: BulletListSize;
  /** Cada ítem entra desde la izquierda, un escalón después del anterior. Por defecto `false`. */
  revealItems?: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLUListElement>, 'className' | 'children'>;

/**
 * Lista con viñetas redondas: "Ideal si:", "Trabajamos con:" y las listas de
 * "Servicios y equipo".
 *
 * La viñeta es un `Dot` y no un `list-style`: el diseño la alinea a la línea
 * base del texto y la sube 2px, cosa que un marcador nativo no permite.
 */
export function BulletList({
  items,
  dotTone = 'accent',
  variant = 'default',
  size = 'md',
  revealItems = false,
  className,
  ...rest
}: BulletListProps) {
  return (
    <ul
      className={cn(
        styles.list,
        SIZE_CLASSES[size],
        variant === 'emphasis' && styles.emphasis,
        className,
      )}
      {...rest}
    >
      {items.map((item, index) => (
        <li
          key={item}
          className={styles.item}
          {...(revealItems ? reveal('left', { delay: index, span: ITEM_REVEAL_SPAN }) : {})}
        >
          <Dot size={DOT_SIZES[size]} tone={dotTone} className={styles.dot} />
          {item}
        </li>
      ))}
    </ul>
  );
}
