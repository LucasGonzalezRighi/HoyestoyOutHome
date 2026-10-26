import 'server-only';

/**
 * Las variables de entorno del servidor, leídas en un solo lugar. Ninguna es
 * `NEXT_PUBLIC_`: no llegan nunca al navegador.
 *
 * - `DATABASE_URL`: Postgres (Neon). La crea Vercel al conectar Storage → Neon.
 * - `BLOB_READ_WRITE_TOKEN`: Vercel Blob, para las fotos. La crea Vercel al
 *   conectar Storage → Blob (la lee `@vercel/blob` sola).
 * - `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`: la entrada
 *   al panel (`server/auth/adminConfig.ts`).
 */
export const serverEnv = {
  databaseUrl: nonEmpty(process.env.DATABASE_URL),
  blobToken: nonEmpty(process.env.BLOB_READ_WRITE_TOKEN),
  adminEmail: nonEmpty(process.env.ADMIN_EMAIL),
  adminPasswordHash: nonEmpty(process.env.ADMIN_PASSWORD_HASH),
  adminSessionSecret: nonEmpty(process.env.ADMIN_SESSION_SECRET),
  /** Corre en Vercel (en cualquier entorno): ahí el disco no sirve para guardar. */
  onVercel: Boolean(process.env.VERCEL),
} as const;

/** Una variable vacía cuenta como no definida (`.env.example` las deja así). */
function nonEmpty(value: string | undefined): string | undefined {
  return value?.trim() ? value.trim() : undefined;
}
