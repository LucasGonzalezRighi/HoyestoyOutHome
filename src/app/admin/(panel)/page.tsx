import { adminContent } from '@/content/admin';
import { AdminPage, Dashboard } from '@/features/admin';
import { requireAdmin } from '@/server/auth/session';
import { readEditableContent } from '@/server/content/editableContent';

/** Inicio del panel. */
export default async function AdminHomePage() {
  await requireAdmin();
  const content = await readEditableContent();
  const { dashboard } = adminContent;
  return (
    <AdminPage title={dashboard.title} lead={dashboard.lead}>
      <Dashboard content={content} />
    </AdminPage>
  );
}
