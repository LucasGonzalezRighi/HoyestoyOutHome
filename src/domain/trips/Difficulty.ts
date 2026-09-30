/**
 * Niveles de dificultad de un viaje. Es un tipo y no una clase porque es solo
 * un dato: el único comportamiento es cómo se lee (`difficultyLabel`).
 *
 * Los valores están en español porque son lo que se muestra ("Dificultad
 * media"), igual que en el diseño.
 */
export const DIFFICULTIES = ['baja', 'media', 'alta'] as const;

/** Nivel de dificultad de un viaje: `'baja' | 'media' | 'alta'`. */
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Guarda de tipo para validar datos que no vienen tipados (p. ej. un CMS futuro). */
export function isDifficulty(value: string): value is Difficulty {
  return (DIFFICULTIES as readonly string[]).includes(value);
}

/** `"Dificultad media"` — el tag de las cards y de la sección de Calle & Stepanek. */
export function difficultyLabel(difficulty: Difficulty): string {
  return `Dificultad ${difficulty}`;
}
