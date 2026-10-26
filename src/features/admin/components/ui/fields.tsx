'use client';

import { CircleAlert } from 'lucide-react';
import { createContext, useContext, useId, useState, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { parseNumber } from './inputValues';
import styles from './ui.module.css';

/**
 * El error de cada campo, por ruta (`itinerary.2.title`). Lo provee
 * `EditorForm` con lo que devolvió el servidor al guardar.
 */
export const IssuesContext = createContext<(path: string) => string | undefined>(() => undefined);

/** El error del campo en esa ruta, si lo hay. */
function useFieldError(path: string | undefined): string | undefined {
  const errorFor = useContext(IssuesContext);
  return path === undefined ? undefined : errorFor(path);
}

/** Lo que comparten todos los campos. */
type FieldBaseProps = {
  /** El `<label>` visible. */
  label: string;
  /** Ayuda debajo del label (también la lee el lector de pantalla). */
  hint?: string;
  /** Ruta del dato en lo que edita la pantalla, para mostrar su error. */
  path?: string;
  /** Oculta el label a la vista (lo sigue leyendo el lector de pantalla). */
  hideLabel?: boolean;
  className?: string;
};

/** Atributos que el envoltorio le pasa al control. */
type ControlProps = {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
};

/** Envoltorio de un campo: label, ayuda, control y error, enlazados por `id`. */
function Field({
  label,
  hint,
  path,
  hideLabel = false,
  className,
  children,
}: FieldBaseProps & { children: (props: ControlProps) => ReactNode }) {
  const id = useId();
  const error = useFieldError(path);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn(styles.field, className)}>
      <label htmlFor={id} className={hideLabel ? styles.visuallyHidden : styles.label}>
        {label}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {children({
        id,
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
        ...(error ? { 'aria-invalid': true as const } : {}),
      })}
      {error && (
        <p id={errorId} className={styles.error}>
          <CircleAlert
            size={15}
            strokeWidth={2.75}
            aria-hidden="true"
            className={styles.errorIcon}
          />
          {error}
        </p>
      )}
    </div>
  );
}

/** Un texto de una línea o, con `multiline`, un párrafo. */
export function TextInput({
  value,
  onChange,
  multiline = false,
  rows = 3,
  placeholder,
  type = 'text',
  list,
  ...field
}: FieldBaseProps & {
  value: string | undefined;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  /** `date` usa el calendario del navegador (`AAAA-MM-DD`). */
  type?: 'text' | 'date';
  /** Id de un `<datalist>` con sugerencias. */
  list?: string;
}) {
  return (
    <Field {...field}>
      {(props) =>
        multiline ? (
          <textarea
            {...props}
            className={styles.control}
            rows={rows}
            value={value ?? ''}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <input
            {...props}
            className={styles.control}
            type={type}
            list={list}
            value={value ?? ''}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        )
      }
    </Field>
  );
}

/** Un número con coma decimal ("11,3"), como se escribe en Argentina. */
function formatNumber(value: number | undefined): string {
  return value === undefined || Number.isNaN(value) ? '' : String(value).replace('.', ',');
}

/**
 * Un número. Mientras se escribe muestra lo escrito tal cual; al salir del
 * campo, el número normalizado. Vacío es "sin dato" (`undefined`).
 */
export function NumberInput({
  value,
  onChange,
  ...field
}: FieldBaseProps & {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <Field {...field}>
      {(props) => (
        <input
          {...props}
          className={styles.control}
          type="text"
          inputMode="decimal"
          value={draft ?? formatNumber(value)}
          onChange={(event) => {
            setDraft(event.target.value);
            onChange(parseNumber(event.target.value));
          }}
          onBlur={() => {
            if (!Number.isNaN(value)) setDraft(null);
          }}
        />
      )}
    </Field>
  );
}

/** Una opción de un desplegable. */
export type SelectOption = { readonly value: string; readonly label: string };

/** Un desplegable. */
export function SelectInput({
  value,
  onChange,
  options,
  ...field
}: FieldBaseProps & {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
}) {
  return (
    <Field {...field}>
      {(props) => (
        <select
          {...props}
          className={styles.control}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

/** Un interruptor sí/no. */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        className={styles.toggleInput}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}
