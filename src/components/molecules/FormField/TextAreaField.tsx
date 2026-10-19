import { cn } from '@/utils/cn';

import { FieldFrame, fieldStateProps } from './FieldFrame';
import styles from './FormField.module.css';
import type { TextAreaFieldProps } from './FormField.types';

/** Renglones visibles por defecto: un mensaje breve entra sin scroll. */
const DEFAULT_ROWS = 5;

/**
 * Campo de texto de varios renglones (`<textarea>`) con su label y su mensaje
 * de error. Mismo aspecto que `TextField`, con el radio de contenedor en vez
 * de la pastilla (ver el módulo CSS).
 *
 * @example <TextAreaField id={id} name="mensaje" label="Mensaje" required error={messageError} />
 */
export function TextAreaField({
  id,
  label,
  error,
  tone = 'default',
  className,
  rows = DEFAULT_ROWS,
  ...rest
}: TextAreaFieldProps) {
  return (
    <FieldFrame id={id} label={label} error={error} tone={tone} className={className}>
      <textarea
        id={id}
        rows={rows}
        className={cn(styles.control, styles.textarea)}
        {...rest}
        {...fieldStateProps(id, error)}
      />
    </FieldFrame>
  );
}
