import { adminContent } from '@/content/admin';
import { AdminPage, HomeTextsEditor } from '@/features/admin';
import { requireAdmin } from '@/server/auth/session';
import { readEditableContent } from '@/server/content/editableContent';

/** Los títulos y bajadas de cada sección del home. */
export default async function AdminTextsPage() {
  await requireAdmin();
  const { record } = await readEditableContent();
  const { texts } = adminContent;
  return (
    <AdminPage title={texts.title} lead={texts.lead}>
      <HomeTextsEditor texts={record.home} />
    </AdminPage>
  );
}
