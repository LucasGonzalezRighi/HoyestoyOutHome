'use server';

import { redirect } from 'next/navigation';

import { ADMIN_ROUTES, adminTripPath } from '@/constants/routes';
import type { SiteRecord } from '@/content/records/schema';
import { requireAdmin } from '@/server/auth/session';
import { saveEditableContent } from '@/server/content/editableContent';

import { relativeIssues, type AdminActionState } from '../actionState';

import { readPayload } from './save';

/** El slug de un viaje sin validar (lo valida el esquema al guardar). */
function slugOf(trip: unknown): string | undefined {
  const slug = (trip as { slug?: unknown } | null)?.slug;
  return typeof slug === 'string' ? slug : undefined;
}

/**
 * Pone un viaje en el contenido: reemplaza al que tenía `originalSlug` (en el
 * mismo lugar del orden) o, si es nuevo, lo suma al final. Si cambió el slug,
 * sus salidas lo siguen.
 */
function placeTrip(record: SiteRecord, trip: unknown, originalSlug: string) {
  const trips: unknown[] = [...record.trips];
  const existing = originalSlug ? record.trips.findIndex((t) => t.slug === originalSlug) : -1;
  const index = existing === -1 ? trips.length : existing;
  trips[index] = trip;

  const newSlug = slugOf(trip);
  const departures =
    existing !== -1 && newSlug && newSlug !== originalSlug
      ? record.departures.map((departure) =>
          departure.tripSlug === originalSlug ? { ...departure, tripSlug: newSlug } : departure,
        )
      : record.departures;

  return { index, record: { ...record, trips, departures } };
}

/**
 * Guarda un viaje desde su editor (`payload`: el `TripRecord`;
 * `originalSlug`: vacío si es nuevo). Si es nuevo o cambió su dirección,
 * vuelve a abrir el editor en la dirección nueva.
 */
export async function saveTrip(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const trip = readPayload(formData);
  const originalSlug = String(formData.get('originalSlug') ?? '');
  if (trip === undefined) {
    return { status: 'error', message: 'El formulario llegó incompleto.', issues: [] };
  }

  let index = 0;
  const result = await saveEditableContent((record) => {
    const placed = placeTrip(record, trip, originalSlug);
    index = placed.index;
    return placed.record;
  });
  if (!result.ok) {
    return {
      status: 'error',
      message: result.message,
      issues: relativeIssues(result.issues, `trips.${index}.`),
    };
  }

  const slug = slugOf(trip);
  if (slug && slug !== originalSlug) redirect(`${adminTripPath(slug)}?guardado=1`);
  return { status: 'saved', savedAt: Date.now() };
}

/**
 * Cambia algo de la lista de viajes (orden, visible, borrar) y vuelve a la
 * lista. Si no se puede guardar, tira: lo muestra la pantalla de error del
 * panel (`app/admin/error.tsx`).
 */
async function updateTrips(change: (record: SiteRecord) => SiteRecord): Promise<void> {
  await requireAdmin();
  const result = await saveEditableContent(change);
  if (!result.ok) throw new Error(result.message);
  redirect(ADMIN_ROUTES.trips);
}

/** Sube o baja un viaje un lugar en el orden del home (`direction`: `up` / `down`). */
export async function moveTrip(formData: FormData): Promise<void> {
  const slug = String(formData.get('slug') ?? '');
  const step = formData.get('direction') === 'up' ? -1 : 1;
  await updateTrips((record) => {
    const trips = [...record.trips];
    const from = trips.findIndex((trip) => trip.slug === slug);
    const to = from + step;
    const moving = trips[from];
    const other = trips[to];
    if (from === -1 || !moving || !other) return record;
    trips[from] = other;
    trips[to] = moving;
    return { ...record, trips };
  });
}

/** Muestra u oculta un viaje (`visible`: `'true'` / `'false'`). */
export async function setTripVisibility(formData: FormData): Promise<void> {
  const slug = String(formData.get('slug') ?? '');
  const visible = formData.get('visible') === 'true';
  await updateTrips((record) => ({
    ...record,
    trips: record.trips.map((trip) => (trip.slug === slug ? { ...trip, visible } : trip)),
  }));
}

/** Borra un viaje y sus salidas. No se puede deshacer desde el panel. */
export async function deleteTrip(formData: FormData): Promise<void> {
  const slug = String(formData.get('slug') ?? '');
  await updateTrips((record) => ({
    ...record,
    trips: record.trips.filter((trip) => trip.slug !== slug),
    departures: record.departures.filter((departure) => departure.tripSlug !== slug),
  }));
}
