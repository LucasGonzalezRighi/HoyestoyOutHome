import { Plus } from 'lucide-react';

import { LinkButton } from '@/components/atoms/Button';
import { ADMIN_ROUTES } from '@/constants/routes';
import { adminContent } from '@/content/admin';
import { AdminPage, TripList } from '@/features/admin';
import { requireAdmin } from '@/server/auth/session';
import { readEditableContent } from '@/server/content/editableContent';

/** Lista de viajes del panel. */
export default async function AdminTripsPage() {
  await requireAdmin();
  const { record } = await readEditableContent();
  const { trips } = adminContent;
  return (
    <AdminPage
      title={trips.title}
      lead={trips.lead}
      actions={
        <LinkButton
          href={ADMIN_ROUTES.newTrip}
          icon={<Plus size={18} strokeWidth={2.75} aria-hidden="true" />}
        >
          {trips.create}
        </LinkButton>
      }
    >
      <TripList trips={record.trips} />
    </AdminPage>
  );
}
