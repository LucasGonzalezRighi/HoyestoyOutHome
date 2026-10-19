import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

import styles from './FormField.module.css';
import type { FieldBaseProps, FieldTone } from './FormField.types';

/** Trazo de los íconos: Lucide a 2.75, regla del design system Organic. */
const ICON_STROKE_WIDTH = 2.75;

/** Lado del ícono del error: acompaña los 14px del mensaje. */
const ERROR_ICON_SIZE = 16;

const TONE_CLASSES: Record<FieldTone, string | undefined> = {
  default: undefined,
  inverse: styles.inverse,
};

/** `id` del mensaje de error de un campo. */
function errorIdOf(id: string): string {
  return `${id}-error`;
}

/**
 * Atributos de accesibilidad del control según tenga error o no. Los tres
 * campos los esparcen en su control.
 */
export function fieldStateProps(id: string, error: string | undefined) {
  return error
    ? { 'aria-invalid': true, 'aria-describedby': errorIdOf(id) }
    : { 'aria-invalid': undefined, 'aria-describedby': undefined };
}

/** Props de `FieldFrame`: las comunes de los campos y el control ya armado. */
type FieldFrameProps = Omit<FieldBaseProps, 'tone'> & {
  tone: FieldTone;
  children: ReactNode;
};

/**
 * El marco de un campo: label arriba, control y, si hay, el mensaje de error
 * abajo. Es interno de la carpeta: desde afuera se usan `TextField`,
 * `TextAreaField` y `SelectField`, que le pasan su control.
 *
 * El error lleva un ícono además del color: el design system no tiene un rojo
 * y sobre el verde del cierre el error es un dorado claro, así que el color
 * solo no alcanza para distinguirlo (WCAG 1.4.1).
 */
export function FieldFrame({ id, label, error, tone, className, children }: FieldFrameProps) {
  return (
    <div className={cn(styles.field, TONE_CLASSES[tone], className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {error && (
        <p id={errorIdOf(id)} className={styles.error}>
          <CircleAlert
            size={ERROR_ICON_SIZE}
            strokeWidth={ICON_STROKE_WIDTH}
            aria-hidden="true"
            className={styles.errorIcon}
          />
          {error}
        </p>
      )}
    </div>
  );
}
