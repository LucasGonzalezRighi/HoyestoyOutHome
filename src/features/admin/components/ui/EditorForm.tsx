'use client';

import { CircleAlert, CircleCheck } from 'lucide-react';
import { useActionState, useCallback, useEffect, useState, type ReactNode } from 'react';

import { Button } from '@/components/atoms/Button';
import { adminContent } from '@/content/admin';

import { IDLE_STATE, type AdminActionState } from '../../actionState';

import styles from './EditorForm.module.css';
import { IssuesContext } from './fields';

const { save: copy } = adminContent;

/** Una acción de guardado del panel (`useActionState`). */
export type SaveAction = (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;

/** Los mensajes de los problemas, sin repetidos. */
function uniqueMessages(state: AdminActionState): string[] {
  return state.status === 'error' ? [...new Set(state.issues.map((issue) => issue.message))] : [];
}

/**
 * El formulario de una pantalla del panel. Manda todo lo que se edita como
 * JSON en un campo oculto (`payload`): el estado vive en el componente
 * cliente de la pantalla, y acá solo se guarda.
 *
 * - Avisa si hay cambios sin guardar (y antes de cerrar la pestaña).
 * - Después de guardar dice "Guardado"; si el servidor rechaza datos, muestra
 *   el resumen arriba de la barra y cada error junto a su campo
 *   (`IssuesContext`).
 * - La barra de guardado queda pegada abajo de la pantalla.
 */
export function EditorForm({
  action,
  payload,
  hiddenFields,
  onIssues,
  children,
}: {
  action: SaveAction;
  /** Lo que se edita, tal cual se guarda. */
  payload: unknown;
  /** Otros campos ocultos (por ejemplo, el slug original de un viaje). */
  hiddenFields?: Readonly<Record<string, string>>;
  /** Avisa los problemas que volvieron del servidor (el editor de viajes marca sus pestañas). */
  onIssues?: (state: AdminActionState) => void;
  children: ReactNode;
}) {
  const json = JSON.stringify(payload);
  const [savedJson, setSavedJson] = useState(json);
  const [state, formAction, pending] = useActionState(
    async (previous: AdminActionState, formData: FormData) => {
      const result = await action(previous, formData);
      if (result.status === 'saved') setSavedJson(String(formData.get('payload')));
      onIssues?.(result);
      return result;
    },
    IDLE_STATE,
  );
  const dirty = json !== savedJson;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const errorFor = useCallback(
    (path: string) =>
      state.status === 'error'
        ? state.issues.find((issue) => issue.path === path)?.message
        : undefined,
    [state],
  );

  const messages = uniqueMessages(state);
  const status = pending
    ? copy.submitting
    : dirty
      ? copy.unsaved
      : state.status === 'saved'
        ? copy.saved
        : '';

  return (
    <form action={formAction} className={styles.form} noValidate>
      <input type="hidden" name="payload" value={json} />
      {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <IssuesContext value={errorFor}>{children}</IssuesContext>

      <div className={styles.bar}>
        {state.status === 'error' && (
          <div className={styles.issues} role="alert">
            <p className={styles.issuesTitle}>
              <CircleAlert size={18} strokeWidth={2.75} aria-hidden="true" />
              {messages.length > 0 ? copy.issuesTitle : state.message}
            </p>
            {messages.length > 0 && (
              <ul className={styles.issuesList}>
                {messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className={styles.barRow}>
          <p className={styles.status} aria-live="polite">
            {!pending && !dirty && state.status === 'saved' && (
              <CircleCheck size={18} strokeWidth={2.75} aria-hidden="true" />
            )}
            {status}
          </p>
          <Button type="submit" disabled={pending}>
            {pending ? copy.submitting : copy.submit}
          </Button>
        </div>
      </div>
    </form>
  );
}
