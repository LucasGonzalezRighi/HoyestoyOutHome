import { cn } from '@/utils/cn';

import styles from './Button.module.css';
import type { ButtonSize, ButtonTone, ButtonVariant } from './Button.types';

const VARIANT_CLASSES: Record<ButtonVariant, string | undefined> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
};

/** `md` es el tamaño base del `.btn`: no necesita clase propia. */
const SIZE_CLASSES: Record<ButtonSize, string | undefined> = {
  md: undefined,
  lg: styles.lg,
  xl: styles.xl,
};

const TONE_CLASSES: Record<ButtonTone, string | undefined> = {
  default: undefined,
  inverse: styles.inverse,
};

/**
 * Clases de un botón. Compartidas por `Button` y `LinkButton`, que solo
 * difieren en el elemento que renderizan.
 */
export function buttonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  tone: ButtonTone,
  className?: string,
): string {
  return cn(
    styles.button,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    TONE_CLASSES[tone],
    className,
  );
}
