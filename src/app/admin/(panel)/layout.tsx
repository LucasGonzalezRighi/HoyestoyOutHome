import type { ReactNode } from 'react';

import { AdminShell } from '@/features/admin';
import { requireAdmin } from '@/server/auth/session';

/**
 * Las pantallas del panel: piden sesión (además del proxy) y van dentro del
 * marco del panel. Cada página y cada acción vuelven a pedirla: un layout no
 * se vuelve a ejecutar en cada navegación.
 */
export default async function PanelLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
