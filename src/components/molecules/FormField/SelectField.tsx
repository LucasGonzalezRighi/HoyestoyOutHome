import { ChevronDown } from 'lucide-react';

import { cn } from '@/utils/cn';

import { FieldFrame, fieldStateProps } from './FieldFrame';
import styles from './FormField.module.css';
import type { SelectFieldProps } from './FormField.types';

/** Trazo de los íconos: Lucide a 2.75, regla del design system Organic. */
const ICON_STROKE_WIDTH = 2.75;

/** Lado de la flecha: acompaña los 16px del texto del control. */
const CHEVRON_SIZE = 18;

/**
 * Lista desplegable (`<select>` nativo) con su label y su mensaje de error.
 *
 * Es el control del navegador, con su teclado y su lista nativa (en el
 * teléfono, la rueda del sistema). Solo se le saca la flecha propia
 * (`appearance: none`) para darle la pastilla del design system, y se dibuja
 * una de Lucide encima, que no recibe clics.
 *
 * @example
 * <SelectField id={id} name="viaje" label="Viaje" placeholder="Elegí un viaje"
 *   options={options} defaultValue="" required />
 */
export function SelectField({
  id,
  label,
  error,
  tone = 'default',
  className,
  options,
  placeholder,
  ...rest
}: SelectFieldProps) {
  return (
    <FieldFrame id={id} label={label} error={error} tone={tone} className={className}>
      <span className={styles.selectFrame}>
        <select
          id={id}
          className={cn(styles.control, styles.select)}
          {...rest}
          {...fieldStateProps(id, error)}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={CHEVRON_SIZE}
          strokeWidth={ICON_STROKE_WIDTH}
          aria-hidden="true"
          className={styles.chevron}
        />
      </span>
    </FieldFrame>
  );
}
