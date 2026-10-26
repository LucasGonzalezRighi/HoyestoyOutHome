import { todayInBusinessTimeZone } from '@/content/catalog/departures';
import { adminContent } from '@/content/admin';
import { AdminPage, DeparturesEditor } from '@/features/admin';
import { requireAdmin } from '@/server/auth/session';
import { readEditableContent } from '@/server/content/editableContent';

/** Las salidas del calendario. */
export default async function AdminDeparturesPage() {
  await requireAdmin();
  const { record } = await readEditableContent();
  const { departures } = adminContent;
  return (
    <AdminPage title={departures.title} lead={departures.lead}>
      <DeparturesEditor
        departures={record.departures}
        trips={record.trips.map(({ slug, name, days, visible }) => ({ slug, name, days, visible }))}
        today={todayInBusinessTimeZone()}
      />
    </AdminPage>
  );
}
