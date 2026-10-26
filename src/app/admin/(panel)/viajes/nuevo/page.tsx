import { ADMIN_ROUTES } from '@/constants/routes';
import { adminContent } from '@/content/admin';
import { AdminPage, TripEditor } from '@/features/admin';
import { requireAdmin } from '@/server/auth/session';

/** Crear un viaje: arranca oculto, para cargarlo de a poco. */
export default async function NewTripPage() {
  await requireAdmin();
  const { tripEditor } = adminContent;
  return (
    <AdminPage
      title={tripEditor.newTitle}
      back={{ href: ADMIN_ROUTES.trips, label: tripEditor.back }}
    >
      <TripEditor />
    </AdminPage>
  );
}
