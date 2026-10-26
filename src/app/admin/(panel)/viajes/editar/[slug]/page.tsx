import { notFound } from 'next/navigation';

import { ADMIN_ROUTES } from '@/constants/routes';
import { adminContent } from '@/content/admin';
import { AdminPage, TripEditor } from '@/features/admin';
import { requireAdmin } from '@/server/auth/session';
import { readEditableContent } from '@/server/content/editableContent';

/** Props de la página: en Next 16 los `params` llegan como Promise. */
type EditTripPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Editar un viaje (también los ocultos). La `key` vuelve a montar el editor si
 * se guarda con otra dirección: arranca limpio con lo recién guardado.
 */
export default async function EditTripPage({ params }: EditTripPageProps) {
  await requireAdmin();
  const { slug } = await params;
  const { record } = await readEditableContent();
  const trip = record.trips.find((candidate) => candidate.slug === slug);
  if (!trip) notFound();

  return (
    <AdminPage
      title={trip.name}
      back={{ href: ADMIN_ROUTES.trips, label: adminContent.tripEditor.back }}
    >
      <TripEditor key={trip.slug} trip={trip} />
    </AdminPage>
  );
}
