import { Landing } from '@/features/landing';
import { getSiteContent } from '@/server/content/siteContent';

/**
 * Cada cuánto se vuelve a armar el home aunque nadie guarde nada en el panel
 * (en segundos): así una salida que ya pasó deja de verse en el calendario al
 * día siguiente. Lo que se guarda en el panel se ve enseguida (la caché del
 * contenido se invalida al guardar).
 */
export const revalidate = 3600;

/** El home: el contenido guardado (o el inicial), prerenderizado y cacheado. */
export default async function Page() {
  const { landing } = await getSiteContent();
  return <Landing content={landing} />;
}
