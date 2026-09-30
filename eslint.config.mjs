import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * ESLint (flat config). Next 16 ya no trae `next lint`: se corre `eslint .`.
 *
 * Mismas reglas duras que Kora: nada de `any` y nada de variables sin usar
 * (salvo argumentos con prefijo `_`, que marcan "lo recibo pero no lo uso").
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // why: la regla busca un directorio `pages/`; este proyecto es solo App Router
      // y todos sus links son anclas (`#viajes`) o externos (WhatsApp, Instagram).
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'docs/**', 'next-env.d.ts']),
]);
