import 'server-only';

import type { SiteRecord } from '@/content/records/schema';
import { requireAdmin } from '@/server/auth/session';
import { saveEditableContent } from '@/server/content/editableContent';

import { relativeIssues, type AdminActionState } from '../actionState';

/** Lee el JSON del campo oculto `payload` del formulario, o `undefined` si no es JSON. */
export function readPayload(formData: FormData): unknown {
  const raw = formData.get('payload');
  if (typeof raw !== 'string') return undefined;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

/** Error genérico para un formulario que llegó roto (no debería pasar desde el panel). */
const BROKEN_FORM: AdminActionState = {
  status: 'error',
  message: 'El formulario llegó incompleto. Recargá la página y probá de nuevo.',
  issues: [],
};

/**
 * El esqueleto de las acciones que guardan una parte del contenido: verifica
 * la sesión, lee el JSON del formulario, aplica el cambio sobre lo último
 * guardado, valida todo y guarda.
 *
 * @param formData El formulario, con el JSON en `payload`.
 * @param apply Pone `payload` en su lugar dentro del contenido (sin validar:
 *   valida `saveEditableContent`).
 * @param prefix Dónde vive esa parte en el contenido (`'faq.'`), para que los
 *   errores le lleguen a cada campo con su ruta relativa.
 */
export async function saveSection(
  formData: FormData,
  apply: (record: SiteRecord, payload: unknown) => unknown,
  prefix: string,
): Promise<AdminActionState> {
  await requireAdmin();
  const payload = readPayload(formData);
  if (payload === undefined) return BROKEN_FORM;
  const result = await saveEditableContent((record) => apply(record, payload));
  return result.ok
    ? { status: 'saved', savedAt: Date.now() }
    : { status: 'error', message: result.message, issues: relativeIssues(result.issues, prefix) };
}
