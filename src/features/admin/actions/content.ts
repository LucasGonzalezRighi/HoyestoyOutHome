'use server';

import type { AdminActionState } from '../actionState';

import { saveSection } from './save';

/*
 * Acciones de las pantallas que guardan una lista o un bloque entero:
 * salidas, preguntas, testimonios y textos del home. Cada una reemplaza su
 * parte del contenido por lo que manda el formulario (ya ordenado como se
 * va a mostrar).
 */

/** Guarda todas las salidas del calendario. */
export async function saveDepartures(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return saveSection(formData, (record, departures) => ({ ...record, departures }), 'departures.');
}

/** Guarda las preguntas frecuentes, en orden. */
export async function saveFaq(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return saveSection(formData, (record, faq) => ({ ...record, faq }), 'faq.');
}

/** Guarda los testimonios, en orden. */
export async function saveTestimonials(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return saveSection(
    formData,
    (record, testimonials) => ({ ...record, testimonials }),
    'testimonials.',
  );
}

/** Guarda los textos del home. */
export async function saveHomeTexts(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return saveSection(formData, (record, home) => ({ ...record, home }), 'home.');
}
