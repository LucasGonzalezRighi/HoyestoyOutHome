import type { ValidationIssue } from '@/content/records/validate';

/**
 * Lo que devuelve una acción de guardado del panel a su formulario
 * (`useActionState`): nada todavía, guardado, o el error con los campos a
 * corregir.
 *
 * Las rutas de los `issues` son relativas a lo que edita esa pantalla
 * (`itinerary.2.title` en el editor de un viaje, `3.answer` en las
 * preguntas): así cada campo encuentra su error sin saber dónde vive en el
 * contenido completo.
 */
export type AdminActionState =
  | { readonly status: 'idle' }
  | { readonly status: 'saved'; readonly savedAt: number }
  | {
      readonly status: 'error';
      readonly message: string;
      readonly issues: readonly ValidationIssue[];
    };

/** Estado inicial de un formulario del panel. */
export const IDLE_STATE: AdminActionState = { status: 'idle' };

/**
 * Pasa las rutas de los problemas a relativas a `prefix` (`trips.2.`). Los que
 * no son de esa parte del contenido quedan con su ruta completa: el panel los
 * muestra igual en el resumen de errores.
 */
export function relativeIssues(
  issues: readonly ValidationIssue[],
  prefix: string,
): ValidationIssue[] {
  return issues.map((issue) =>
    issue.path.startsWith(prefix) ? { ...issue, path: issue.path.slice(prefix.length) } : issue,
  );
}
