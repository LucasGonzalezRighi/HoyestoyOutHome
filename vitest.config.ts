import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * Tests unitarios de la lógica pura: dominio (`src/domain`), motor de
 * animación (`src/motion`), la lectura del nivel de animaciones
 * (`src/design-system/tokens`) y las funciones puras de un feature que arman
 * datos para un Client Component (`features/services/toServiceTabs`). Los
 * componentes no se testean acá: son presentacionales y se validan a ojo
 * contra el diseño.
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
