/*
 * Conversiones puras entre lo que muestra un control del panel y lo que se
 * guarda. Viven aparte de los componentes para poder probarlas sin React ni
 * Server Actions.
 */

/**
 * Lee un número como se escribe en Argentina: "11,3" → 11.3 y "4.290" → 4290
 * (el punto con tres cifras detrás es de miles). "11.3" también se entiende
 * como decimal. Vacío → `undefined`; cualquier otra cosa → `NaN` (lo rechaza
 * el esquema al guardar).
 */
export function parseNumber(text: string): number | undefined {
  const trimmed = text.trim().replace(/\s/g, '');
  if (trimmed === '') return undefined;
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : /^\d{1,3}(\.\d{3})+$/.test(trimmed)
      ? trimmed.replace(/\./g, '')
      : trimmed;
  return Number(normalized);
}

/** El porcentaje vertical de un encuadre "center 62%" (50 si es otro o no hay). */
export function verticalFraming(position: string | undefined): number {
  const match = position?.match(/^center (\d{1,3})%$/);
  return match ? Math.min(100, Number(match[1])) : 50;
}

/** El encuadre para un porcentaje vertical (50 es el neutro: no se guarda). */
export function framingPosition(percent: number): string | undefined {
  return percent === 50 ? undefined : `center ${percent}%`;
}
