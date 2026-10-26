import { adminContent } from '@/content/admin';
import { AdminPage, TestimonialsEditor } from '@/features/admin';
import { requireAdmin } from '@/server/auth/session';
import { readEditableContent } from '@/server/content/editableContent';

/** Los testimonios de la cinta del home. */
export default async function AdminTestimonialsPage() {
  await requireAdmin();
  const { record } = await readEditableContent();
  const { testimonials } = adminContent;
  return (
    <AdminPage title={testimonials.title} lead={testimonials.lead}>
      <TestimonialsEditor
        testimonials={record.testimonials}
        tripNames={record.trips.map((trip) => trip.shortName)}
      />
    </AdminPage>
  );
}
