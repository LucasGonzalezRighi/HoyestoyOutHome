import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

/**
 * Sobre qué fondo va el campo.
 *
 * - `default`: sobre el crema de la página (relleno `--color-surface`, como el
 *   `.input` del design system).
 * - `inverse`: sobre un fondo oscuro (la tarjeta verde del cierre). El campo
 *   pasa a crema y el label y el error, a tonos claros.
 */
export type FieldTone = 'default' | 'inverse';

/**
 * Lo que comparten los tres campos: el label visible, el error y el tono.
 *
 * Con `error`, el control lleva `aria-invalid` y `aria-describedby` apuntando
 * al mensaje, así el lector de pantalla lo lee al enfocar el campo. Sin
 * `error`, no lleva ninguno de los dos (un `aria-describedby` a un nodo que no
 * existe no sirve de nada).
 */
export type FieldBaseProps = {
  /** `id` del control. El label (`htmlFor`) y el mensaje de error (`<id>-error`) se cuelgan de él. */
  id: string;
  /** Texto del `<label>`, desde `content/`. */
  label: string;
  /** Mensaje de error visible, desde `content/`. Mientras está, el campo se marca inválido. */
  error?: string;
  /** Por defecto `default`. */
  tone?: FieldTone;
  /** Clase del envoltorio (label + control + error). */
  className?: string;
};

/** Atributos que arma el campo y que quien lo usa no puede pisar. */
type ManagedAttributes = 'id' | 'className' | 'aria-invalid' | 'aria-describedby';

/** Props de `TextField`: las comunes más cualquier atributo de `<input>` (`name`, `required`, `autoComplete`…). */
export type TextFieldProps = FieldBaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, ManagedAttributes>;

/** Props de `TextAreaField`: las comunes más cualquier atributo de `<textarea>`. */
export type TextAreaFieldProps = FieldBaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, ManagedAttributes>;

/** Una opción del `<select>`. */
export type SelectFieldOption = {
  /** Lo que se envía con el formulario. */
  readonly value: string;
  /** Lo que se lee en la lista. */
  readonly label: string;
};

/** Props de `SelectField`: las comunes, las opciones y cualquier atributo de `<select>`. */
export type SelectFieldProps = FieldBaseProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, ManagedAttributes | 'children'> & {
    /** Las opciones, en orden. */
    options: readonly SelectFieldOption[];
    /**
     * Texto de la opción vacía del principio ("Elegí un viaje"). Va con
     * `value=""` y deshabilitada: con `required`, el campo es inválido hasta
     * que se elige otra (`validity.valueMissing`). Para que arranque elegida,
     * quien lo usa pasa `defaultValue=""`.
     */
    placeholder?: string;
  };
