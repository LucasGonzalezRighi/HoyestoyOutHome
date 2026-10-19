import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * Tests unitarios de la lógica pura: dominio (`src/domain`), motor de
 * animación (`src/motion`), los tokens de movimiento
 * (`src/design-system/tokens`), la URL pública (`src/constants/siteUrl`), la
 * función que arma contenido (`content/trips/tripMetrics`), las funciones
 * puras de los features (`features/trip-detail/checklistPanels`,
 * `features/contact/contactMail`, el `carouselScroll` del carrusel de viajes)
 * y la de `LinkButton` que decide si un link navega con el router
 * (`components/atoms/Button/isRouterHref`). Los componentes en sí no se
 * testean acá: son presentacionales y se validan en el navegador.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
