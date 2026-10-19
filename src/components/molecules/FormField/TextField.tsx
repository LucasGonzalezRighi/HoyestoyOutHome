import { FieldFrame, fieldStateProps } from './FieldFrame';
import styles from './FormField.module.css';
import type { TextFieldProps } from './FormField.types';

/**
 * Campo de texto de una línea (`<input>`) con su label y su mensaje de error:
 * el `.field` + `.input` del design system Organic.
 *
 * Es presentacional: la validación la decide quien lo usa y le pasa el
 * mensaje por `error`.
 *
 * @example <TextField id={id} name="nombre" label="Nombre" required error={nameError} />
 */
export function TextField({
  id,
  label,
  error,
  tone = 'default',
  className,
  type = 'text',
  ...rest
}: TextFieldProps) {
  return (
    <FieldFrame id={id} label={label} error={error} tone={tone} className={className}>
      <input
        id={id}
        type={type}
        className={styles.control}
        {...rest}
        {...fieldStateProps(id, error)}
      />
    </FieldFrame>
  );
}
