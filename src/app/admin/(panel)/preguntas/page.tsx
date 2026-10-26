import { adminContent } from '@/content/admin';
import { AdminPage, FaqEditor } from '@/features/admin';
import { requireAdmin } from '@/server/auth/session';
import { readEditableContent } from '@/server/content/editableContent';

/** Las preguntas frecuentes del home. */
export default async function AdminFaqPage() {
  await requireAdmin();
  const { record } = await readEditableContent();
  const { faq } = adminContent;
  return (
    <AdminPage title={faq.title} lead={faq.lead}>
      <FaqEditor entries={record.faq} />
    </AdminPage>
  );
}
