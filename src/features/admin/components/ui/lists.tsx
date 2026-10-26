'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { adminContent } from '@/content/admin';
import { cn } from '@/utils/cn';

import { TextInput } from './fields';
import styles from './ui.module.css';

const ICON = { size: 18, strokeWidth: 2.75, 'aria-hidden': true } as const;
const { list: copy } = adminContent;

/** Mueve un elemento de una lista un lugar (`step`: -1 sube, 1 baja). */
export function moveItem<T>(items: readonly T[], index: number, step: -1 | 1): T[] {
  const next = [...items];
  const target = index + step;
  const [item] = next.splice(index, 1);
  if (item === undefined || target < 0 || target > items.length - 1) return [...items];
  next.splice(target, 0, item);
  return next;
}

/** Reemplaza el elemento `index` de una lista. */
export function replaceItem<T>(items: readonly T[], index: number, item: T): T[] {
  return items.map((current, i) => (i === index ? item : current));
}

/** Saca el elemento `index` de una lista. */
export function removeItem<T>(items: readonly T[], index: number): T[] {
  return items.filter((_, i) => i !== index);
}

/** Subir, bajar y quitar un elemento. `name` completa el nombre accesible ("Subir Día 2"). */
export function ItemControls({
  name,
  index,
  count,
  onMove,
  onRemove,
}: {
  name: string;
  index: number;
  count: number;
  onMove: (step: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className={styles.itemControls}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={`${copy.moveUp} ${name}`}
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        <ArrowUp {...ICON} />
      </button>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={`${copy.moveDown} ${name}`}
        disabled={index === count - 1}
        onClick={() => onMove(1)}
      >
        <ArrowDown {...ICON} />
      </button>
      <button
        type="button"
        className={cn(styles.iconButton, styles.danger)}
        aria-label={`${copy.remove} ${name}`}
        onClick={onRemove}
      >
        <Trash2 {...ICON} />
      </button>
    </div>
  );
}

/** Botón "Agregar …" al pie de una lista. */
export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.textButton} onClick={onClick}>
      <Plus size={16} strokeWidth={2.75} aria-hidden="true" />
      {label}
    </button>
  );
}

/**
 * Una lista de elementos con varios campos cada uno (días del cronograma,
 * preguntas, testimonios): cada uno en su tarjeta, con su título y los
 * botones para ordenarlo o quitarlo.
 */
export function ListField<T>({
  items,
  onChange,
  create,
  addLabel,
  itemTitle,
  keyOf = (_, index) => String(index),
  renderItem,
}: {
  items: readonly T[];
  onChange: (items: T[]) => void;
  /** Un elemento nuevo, vacío. */
  create: () => T;
  addLabel: string;
  /** El título de cada tarjeta ("Día 2", "Pregunta 3"). */
  itemTitle: (item: T, index: number) => string;
  keyOf?: (item: T, index: number) => string;
  renderItem: (item: T, index: number, update: (item: T) => void) => ReactNode;
}) {
  return (
    <>
      {items.length === 0 ? (
        <p className={styles.empty}>{copy.empty}</p>
      ) : (
        <ol className={styles.list}>
          {items.map((item, index) => {
            const title = itemTitle(item, index);
            return (
              <li key={keyOf(item, index)} className={styles.listItem}>
                <div className={styles.listItemHeader}>
                  <h3 className={styles.listItemTitle}>{title}</h3>
                  <ItemControls
                    name={title}
                    index={index}
                    count={items.length}
                    onMove={(step) => onChange(moveItem(items, index, step))}
                    onRemove={() => onChange(removeItem(items, index))}
                  />
                </div>
                {renderItem(item, index, (next) => onChange(replaceItem(items, index, next)))}
              </li>
            );
          })}
        </ol>
      )}
      <AddButton label={addLabel} onClick={() => onChange([...items, create()])} />
    </>
  );
}

/**
 * Una lista de textos (párrafos, ítems de "qué incluye", palabras de la
 * cinta): un campo por renglón, con sus botones al lado.
 */
export function StringListField({
  label,
  hint,
  path,
  items,
  onChange,
  itemLabel,
  addLabel,
  multiline = false,
}: {
  label: string;
  hint?: string;
  /** Ruta de la lista: el error de cada renglón es `${path}.${index}`. */
  path: string;
  items: readonly string[];
  onChange: (items: string[]) => void;
  /** Nombre de cada renglón ("Párrafo"): se numera solo. */
  itemLabel: string;
  addLabel: string;
  multiline?: boolean;
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.label}>{label}</legend>
      {hint && <p className={styles.hint}>{hint}</p>}
      {items.length > 0 && (
        <ol className={styles.list}>
          {items.map((item, index) => {
            const name = `${itemLabel} ${index + 1}`;
            return (
              <li key={index} className={styles.inlineItem}>
                <TextInput
                  label={name}
                  hideLabel
                  path={`${path}.${index}`}
                  value={item}
                  multiline={multiline}
                  onChange={(value) => onChange(replaceItem(items, index, value))}
                />
                <ItemControls
                  name={name}
                  index={index}
                  count={items.length}
                  onMove={(step) => onChange(moveItem(items, index, step))}
                  onRemove={() => onChange(removeItem(items, index))}
                />
              </li>
            );
          })}
        </ol>
      )}
      <AddButton label={addLabel} onClick={() => onChange([...items, ''])} />
    </fieldset>
  );
}
