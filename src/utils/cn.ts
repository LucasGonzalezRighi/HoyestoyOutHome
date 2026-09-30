/** Valores aceptados por `cn`: los falsy se descartan, para poder escribir `cond && styles.x`. */
export type ClassValue = string | false | null | undefined;

/**
 * Une clases de CSS Modules, descartando las condicionales que no aplican.
 *
 * No hace falta resolver conflictos (como `tailwind-merge` en Kora): con CSS
 * Modules cada clase es única por componente, y la cascada la decide el orden
 * en la hoja, no el orden en el atributo `class`.
 *
 * @example cn(styles.button, isActive && styles.active, className)
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
