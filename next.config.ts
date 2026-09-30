import type { NextConfig } from 'next';

/**
 * Configuración de Next.
 *
 * - `reactStrictMode`: monta dos veces en desarrollo. El motor de animación
 *   (`src/motion/`) está escrito para sobrevivirlo: `start()`/`dispose()` son
 *   idempotentes y limpian todos sus listeners.
 * - `images.formats`: las fotos del diseño son JPG de 1–1,6 MP. Servirlas en
 *   AVIF/WebP con `next/image` baja el peso de la página a menos de la mitad.
 * - `agentRules: false`: desde 16.3, `next dev` le agrega a `CLAUDE.md` un
 *   bloque en inglés que apunta a la documentación de la versión instalada.
 *   Ese dato ya está en `CLAUDE.md` §3 (en español y en su lugar), así que se
 *   apaga para que el documento no se reescriba solo en cada `npm run dev`.
 */
const nextConfig: NextConfig = {
  agentRules: false,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
